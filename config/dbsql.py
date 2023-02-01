from datetime import datetime, timedelta
from os import getenv
from dotenv import load_dotenv
import mysql.connector
load_dotenv()


class MydbSql:
    def __init__(self,):
        self.connect()

    def connect(self):
        self.__mydb = mysql.connector.connect(
            host=getenv('SQSERVER'),
            user=getenv('SQUSER'),
            password=getenv("SQPASS"),
            database=getenv("SQDATABASE")
        )
        self.__mycursor = self.__mydb.cursor()

    def cursorExecute(self, param):
        try:
            self.__mycursor.execute(param)
        except:
            self.connect()
            self.__mycursor.execute(param)
        return self.__mycursor.fetchall()

    def __monthdelta(self, date, delta):
        m, y = (date.month+delta) % 12, date.year + \
            ((date.month)+delta-1) // 12
        if not m:
            m = 12
        d = min(date.day, [31,
                           29 if y % 4 == 0 and (
                               not y % 100 == 0 or y % 400 == 0) else 28,
                           31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m-1])
        return date.replace(day=d, month=m, year=y)

    def getQuery(self, key: str, temporary: str):
        if temporary == "1D":
            dateInit = datetime.today() - timedelta(days=1)
            dateInit = dateInit.strftime("%Y-%m-%d %H:%M:%S")
            query = """SELECT Time_Stamp, {0}
                FROM TREND001
                WHERE Time_Stamp BETWEEN '{1}' AND NOW() AND MOD(MINUTE(Time_Stamp), 5) = 0;""".format(
                key, dateInit)

        elif temporary == "7D":
            dateInit = datetime.today() - timedelta(days=7)
            dateInit = dateInit.strftime("%Y-%m-%d %H:%M:%S")
            query = """SELECT Time_Stamp, {0}
                FROM TREND001
                WHERE Time_Stamp BETWEEN '{1}' AND NOW() AND MOD(MINUTE(Time_Stamp), 30) = 0;""".format(key, dateInit)
        elif temporary == "1M":
            dateInit = self.__monthdelta(datetime.today(), -1)
            dateInit = dateInit.strftime("%Y-%m-%d %H:%M:%S")
            query = """SELECT DATE(Time_Stamp) AS Fecha,  AVG({0}) as {0}
                FROM TREND001
                WHERE Time_Stamp > '{1}'
                GROUP BY Fecha;""".format(key, dateInit)
            myresult = self.cursorExecute(query)
            self.listReturn = [[], []]
            for x in myresult:
                self.listReturn[0].append(x[0].strftime("%Y-%m-%d"))
                self.listReturn[1].append(x[1])
            return self.listReturn
        elif temporary == "6M":
            dateInit = self.__monthdelta(datetime.today(), -6)
            dateInit = dateInit.strftime("%Y-%m-%d %H:%M:%S")
            query = """SELECT DATE(Time_Stamp) AS Fecha,  AVG({0}) as {0}
                FROM TREND001
                WHERE Time_Stamp > '{1}'
                GROUP BY Fecha;""".format(key, dateInit)
            myresult = self.cursorExecute(query)
            self.listReturn = [[], []]
            for x in myresult:
                self.listReturn[0].append(x[0].strftime("%Y-%m-%d"))
                self.listReturn[1].append(x[1])
            return self.listReturn
        else:
            raise Exception("Temporality not accepted")
        myresult = self.cursorExecute(query)
        self.listReturn = [[], []]
        for x in myresult:
            self.listReturn[0].append(x[0].strftime("%Y-%m-%d %H:%M:%S"))
            self.listReturn[1].append(x[1])
        return self.listReturn


dataSql = MydbSql()
