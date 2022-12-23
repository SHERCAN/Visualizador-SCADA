# -----------------------------------modules-----------------------------
import asyncio
from security.verify_route import VerifyTokenRoute
import uvicorn
from fastapi import FastAPI
# from routes.main import web
# from config.var_env import mode
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from datetime import datetime
from fastapi.responses import FileResponse
from fastapi import APIRouter
from starlette.responses import RedirectResponse
import pathlib
from fastapi import Request, WebSocketDisconnect
from fastapi.websockets import WebSocket
from websockets.exceptions import ConnectionClosed
from security.jwt_functions import validate_token, write_token
import json
from csv import DictWriter
from security.auth import auth_routes
from classobject.classes import signupClass, Hash
from config.bd import dataBase
from bson.objectid import ObjectId
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from starlette.status import HTTP_302_FOUND
from security.jwt_functions import validate_token, write_token
from typing import Dict, List
from time import sleep

main = APIRouter()

templates = Jinja2Templates(directory='templates')


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        await websocket.close()

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_json(message)


manager = ConnectionManager()
datasNotFiltered = {}


@main.get('/signin', response_class=HTMLResponse)
async def signin(request: Request):
    context = {'request': request}
    response = templates.TemplateResponse('signin.html', context=context)
    return response


@main.post("/signin")
async def login(email: str = Form(), password: str = Form(), request: Request = None):
    try:
        user = list(dataBase.readUser(id=email))
    except:
        # sin conexión base de datos
        context = {'request': request, 'message': 'BD'}
        response = templates.TemplateResponse(
            'signin.html', context=context)
        return response
    if len(user) > 0:
        if Hash.verify_password(password, user[0]['password']):
            token = write_token({'email': email})
            response = RedirectResponse('/', status_code=HTTP_302_FOUND)
            response.set_cookie(key="Authorization", value=token)
        else:
            context = {'request': request, 'message': 'IP'}
            response = templates.TemplateResponse(
                'signin.html', context=context)
    else:
        context = {'request': request, 'message': 'ENT'}
        response = templates.TemplateResponse(
            'signin.html', context=context)
    return response


@main.post('/userin', response_class=HTMLResponse)
async def signin(username: str = Form(), password: str = Form(), email: str = Form(), code: str = Form(), request: Request = None):
    insert = None
    if code == 'enerion':
        insert = signupClass.postUser(email=email, password=Hash.get_password_hash(
            password), username=username)

    if insert is not None:
        context = {'request': request, 'message': 'User created'}
        response = templates.TemplateResponse('signin.html', context=context)
        return response
    else:
        context = {'request': request, 'message': 'AAC'}
        response = templates.TemplateResponse('signup.html', context=context)
        return response


@main.get('/signup', response_class=HTMLResponse)
async def signup(request: Request):
    context = {'request': request}
    response = templates.TemplateResponse('signup.html', context=context)
    return response


@main.get("/get_csv")
async def get_csv():
    return FileResponse('data.csv', filename='data.csv')


@main.post('/addData')
async def webhook(request: dict):

    if str(datetime.now().strftime("%S")) == str("00") and control1:
        try:
            datasNotFiltered = request
            dataBase.sendData(request)
        except:
            pass
            control1 = False
    else:
        control1 = True

    return ''


@main.get('/addData')
async def addData(request: Request):
    return {'server': 'on'}

clients = []


async def listen():
    while True:
        for client in clients:
            print(clients)
            await client.send_text(f"Mensaje del servidor: Un nuevo cliente se ha conectado!")
            await asyncio.sleep(0.1)


@main.websocket("/ws/{cli}")
async def websocket_endpoint(websocket: WebSocket, cli: str):
    await websocket.accept()
    clients.append(websocket)
    await websocket.send_text("Bienvenido al servidor!")
    hilo = asyncio.create_task(listen())

    # Ejecuta la función `listen` en un proceso separado
    # proceso = asyncio.create_task(listen(), type=asyncio.Proceso)
    # loop = asyncio.get_running_loop()
    # while True:
    # asyncio.run_coroutine_threadsafe(listen(), loop)
    # await asyncio.sleep(0.2)
    # await manager.connect(websocket)
    # try:
    #     while True:
    #         sleep(1)
    #         await manager.broadcast('Cierto')
    # except (WebSocketDisconnect, ConnectionClosed):
    #     print('desc')
    #     await manager.disconnect(websocket)
    # except Exception as e:
    #     await manager.disconnect(websocket)
    #     print(e, 'sal')
    #     pass


@main.get("/get_register/{cli}/{reg}", response_class=JSONResponse)
async def get_register(request: Request, reg: str, cli: str):
    # cli es cliente y reg es el registro a solicitar
    documentos: list = dataBase.readDataData()[0]
    documentos.pop("_id")
    print(documentos)
    for _, value in documentos.items():
        # Recorre todos los campos del documento
        for campo, valor in value.items():
            print(valor.replace(" ", ""), reg)
            # Si el valor del campo es igual al valor buscado, muestra el nombre del campo
            if valor.replace(" ", "") == reg:
                keyCampo = campo
                break
    print(keyCampo)
    consulta = [{'client': cli}, {keyCampo: 1}]
    getData = dataBase.readData(consulta)
    base = list(getData).copy()
    for data in base:
        data['data'] = data[keyCampo]
        data.pop(keyCampo)
        data.pop('_id')
    base = jsonable_encoder(base)
    return JSONResponse(content=base)
