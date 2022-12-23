# -----------------------------------modules-----------------------------
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
import datetime as dt
from fastapi import APIRouter
from starlette.responses import RedirectResponse
import pathlib
import json
from datetime import datetime
from security.auth import auth_routes
from dotenv import load_dotenv
from config.bd import dataBase
from fastapi.responses import FileResponse
from csv import DictWriter
from bson.objectid import ObjectId
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
load_dotenv()

routes = APIRouter(route_class=VerifyTokenRoute)
# routes = APIRouter()

templates = Jinja2Templates(directory='templates')


@routes.get('/index', response_class=HTMLResponse)
async def main(request: Request):
    data = dataBase.readDataData()[0]
    data.pop('_id')
    for k, _ in data.items():
        data[k]['All'] = 'All'
    print(data)
    clientes = dataBase.conn['Clients'].find()
    states = []
    cities = []
    clients = []
    for client in clientes:
        states.append(client['state'])
        cities.append(client['city'])
        clients.append(client['_id'])
    context = {'request': request, 'data': data,
               'states': states, 'cities': cities, 'clients': clients}
    response = templates.TemplateResponse('index.html', context=context)
    return response


@routes.get('/', response_class=HTMLResponse)
async def main():
    response = RedirectResponse('/index')
    return response


@routes.get('/addclient', response_class=HTMLResponse)
async def main(request: Request):
    context = {'request': request}
    response = templates.TemplateResponse('addclient.html', context=context)
    return response


@routes.post('/addclient', response_class=HTMLResponse)
async def main(state: str = Form(), city: str = Form(), client: str = Form(), request: Request = None):
    context = {'request': request}
    dataBase.sendClient({'state': state, 'city': city, 'client': client})
    response = templates.TemplateResponse('addclient.html', context=context)
    return response


@routes.get('/token', response_class=HTMLResponse)
async def main(request: Request):
    context = {'request': request}
    response = templates.TemplateResponse('token.html', context=context)
    return response


@routes.post("/get_registers")
async def get_registers(request: Request):
    datos = await request.form()
    dataAllRegisters = dataBase.readDataData()
    datos = jsonable_encoder(datos)
    print(datos)
    # FormData([('PV[]', 'PVInput1'), ('Empty[]', 'Withoutname'), ('Battery[]', 'BatteryCapacitySOC%'), ('Generator[]', 'GeneratorrelayFrequency'), ('Configuration[]',
    #          'ControlMode'), ('initialdate', '2022-12-01'), ('finaldate', '2022-12-02'), ('state[]', 'Bogotá'), ('city[]', 'Usaquen'), ('clients[]', 'CLI-BO-SU-23')])
    dictAux = {}
    dictData: dict = dataAllRegisters[0].copy()
    dictData.pop('_id')
    listaAux = []
    # print(dictData)
    for i in datos.values():
        for v in dictData.values():
            # print(i, type(v))
            listaAux = [key for key, value in v.items()
                        if value.replace(" ", "") == i]
            if len(listaAux) > 0:
                dictAux[str(listaAux[0])] = 1
    print(dictAux)
    if datos.get('initialdate') == '':
        fecha_inicio = '2022-12-02'
    else:
        fecha_inicio = datos.get('initialdate').strip()
    if datos.get('finaldate') == '':
        fecha_fin = '2022-12-03'
    else:
        fecha_fin = datos.get('finaldate').strip()
    print(fecha_fin, fecha_inicio)
    timestamp_inicio = int(datetime.strptime(
        fecha_inicio, "%Y-%m-%d").timestamp())
    timestamp_fin = int(datetime.strptime(fecha_fin, "%Y-%m-%d").timestamp())
    consulta = {"_id": {"$gte": ObjectId.from_datetime(datetime.fromtimestamp(timestamp_inicio)),
                        "$lt": ObjectId.from_datetime(datetime.fromtimestamp(timestamp_fin))}}
    # consulta.update(dictAux)
    print(consulta)
    getData = dataBase.conn['Variables'].find(consulta, dictAux)
    # getData = dataBase.readData(kwargs=consulta)
    print(getData[0])
    base = list(getData).copy()
    for data in base:
        data['TimeStamp'] = ObjectId(data['_id']).generation_time
        data.pop('_id')
    base = jsonable_encoder(base)
    keys = list(data.keys())
    keys.reverse()
    print('control')
    with open('data.csv', 'w', newline='') as csvFilefromMongodb:
        tuliscsv = DictWriter(
            csvFilefromMongodb, fieldnames=keys, delimiter=",")
        tuliscsv.writeheader()
        tuliscsv.writerows(base)
    print('control1')
    return FileResponse('data.csv', filename='data.csv')


@ routes.get('/chart', response_class=HTMLResponse)
async def main(request: Request):
    context = {'request': request}
    response = templates.TemplateResponse('chart.html', context=context)
    return response
# @routes.post('/', response_class=HTMLResponse)
# async def main(request: Request):

#     context = {'request': request}
#     response = templates.TemplateResponse('index.html', context=context)
#     return response
