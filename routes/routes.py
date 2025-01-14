# -----------------------------------modules-----------------------------
from security.verify_route import VerifyTokenRoute
from fastapi.templating import Jinja2Templates
from fastapi import Request, Form, APIRouter
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from starlette.responses import RedirectResponse
import json
from datetime import datetime
from dotenv import load_dotenv
from config.bd import dataBase
from config.dbsql import dataSql
from csv import DictWriter
from bson.objectid import ObjectId
from fastapi.encoders import jsonable_encoder
from requests import get
load_dotenv()

routes = APIRouter(route_class=VerifyTokenRoute)
# routes = APIRouter()

templates = Jinja2Templates(directory='templates')


@routes.get('/index', response_class=HTMLResponse)
async def mainindex(request: Request):
    data = dataBase.readDataData()[0]
    data.pop('_id')
    for k, _ in data.items():
        data[k]['All'] = 'All'
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
async def mainToIndex():
    response = RedirectResponse('/scada')
    return response


@routes.get('/addclient', response_class=HTMLResponse)
async def mainAddClientGet(request: Request):
    context = {'request': request}
    response = templates.TemplateResponse('addclient.html', context=context)
    return response


@routes.post('/addclient', response_class=HTMLResponse)
async def mainAddClientPost(state: str = Form(), city: str = Form(),
                            zipcode: str = Form(), client: str = Form(),
                            electricCo: str = Form(), sector: str = Form(), ratename: str = Form(),
                            request: Request = None):
    context = {'request': request, 'upload': True}
    print({'state': state, 'city': city, 'client': client, 'zipcode': zipcode,
          'electricCo': electricCo, 'sector': sector, 'ratename': ratename})
    response = templates.TemplateResponse('addclient.html', context=context)
    return response


@routes.get('/token', response_class=HTMLResponse)
async def mainTokenGet(request: Request):
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
    # print(dictAux)
    if datos.get('initialdate') == '':
        fecha_inicio = '2022-12-02'
    else:
        fecha_inicio = datos.get('initialdate').strip()
    if datos.get('finaldate') == '':
        fecha_fin = '2022-12-03'
    else:
        fecha_fin = datos.get('finaldate').strip()
    # print(fecha_fin, fecha_inicio)
    timestamp_inicio = int(datetime.strptime(
        fecha_inicio, "%Y-%m-%d").timestamp())
    timestamp_fin = int(datetime.strptime(fecha_fin, "%Y-%m-%d").timestamp())
    consulta = {"_id": {"$gte": ObjectId.from_datetime(datetime.fromtimestamp(timestamp_inicio)),
                        "$lt": ObjectId.from_datetime(datetime.fromtimestamp(timestamp_fin))}}
    # consulta.update(dictAux)
    # print(consulta)
    getData = dataBase.conn['Variables'].find(consulta, dictAux)
    # getData = dataBase.readData(kwargs=consulta)
    # print(getData[0])
    base = list(getData).copy()
    for data in base:
        data['TimeStamp'] = ObjectId(data['_id']).generation_time
        data.pop('_id')
    base = jsonable_encoder(base)
    keys = list(data.keys())
    keys.reverse()
    # print('control')
    with open('data.csv', 'w', newline='') as csvFilefromMongodb:
        tuliscsv = DictWriter(
            csvFilefromMongodb, fieldnames=keys, delimiter=",")
        tuliscsv.writeheader()
        tuliscsv.writerows(base)
    # print('control1')
    return FileResponse('data.csv', filename='data.csv')


@ routes.get('/charts', response_class=HTMLResponse)
async def main(request: Request):
    context = {'request': request}
    response = templates.TemplateResponse('charts.html', context=context)
    return response
# @routes.post('/', response_class=HTMLResponse)
# async def main(request: Request):

#     context = {'request': request}
#     response = templates.TemplateResponse('index.html', context=context)
#     return response


@routes.get('/scada', response_class=HTMLResponse)
async def scadaGet(request: Request):
    context = {'request': request}
    response = templates.TemplateResponse('scada.html', context=context)
    return response


@routes.get('/info')
async def addData(request: Request):
    return dataBase.data
    # return {'data': 'datos de la base'}


@routes.get('/saving', response_class=HTMLResponse)
async def scada(request: Request):
    context = {'request': request}
    response = templates.TemplateResponse('saving.html', context=context)
    return response


@routes.get('/companyrate', response_class=JSONResponse)
async def companiRates(value: str = '', sector: str = '', company: str = '', substr: str = ''):
    try:
        listCo = []
        if value == 'rates':
            response = get("https://api.openei.org/utility_rates?version=latest&format=json&api_key=XVKe43UvrJ0mduASGIthdBV2yCvzfdAjmaaW6cuZ&orderby=enddate&limit=30",
                           params={'sector': sector, 'ratesforutility': company})
            rangoCo = response.json()['items']
            for i in rangoCo:
                if i.get('enddate') == None:
                    listCo.append(i['name'])
        elif value == 'companies':
            response = get("https://openei.org/w/api.php?action=sfautocomplete&limit=500&format=json&category=EIA%20Utility%20Companies%20and%20Aliases" +
                           "&substr=" + substr)
            rangoCo = json.loads(response.content.decode())['sfautocomplete']
            for i in rangoCo:
                listCo.append(i['title'])
    except:
        listCo = {'data': 'error'}
    return listCo


@routes.get('/scadacopy', response_class=HTMLResponse)
async def scadacopy(request: Request):
    context = {'request': request}
    return templates.TemplateResponse('scadacopy.html', context=context)


@routes.get('/db', response_class=JSONResponse)
async def db(key: str, temporary: str, date: str = ""):
    if date == "":
        dateI = datetime.now()
    else:
        dateI = datetime.strptime(date, '%Y-%m-%d')
    # try:
    responseSql = dataSql.getQuery(
        key=key, temporary=temporary, date=dateI)
    if len(responseSql[0]) == 0:
        return [[0], [0]]
    else:
        return responseSql
    # except Exception as e:
    #     print("except", e)
    #     return {'data': 'error'}
