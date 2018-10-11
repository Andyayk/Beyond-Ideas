import datetime, csv

from flask import Flask
from flask.ext.mysql import MySQL
from flask_appbuilder import Model
from flask_appbuilder.models.mixins import AuditMixin, FileColumn, ImageColumn
from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship

"""

You can use the extra Flask-AppBuilder fields and Mixin's

AuditMixin will add automatic timestamp of created and modified by who


"""

mindate = datetime.date(datetime.MINYEAR, 1, 1)

app = Flask(__name__)

mysql = MySQL()

# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = ''
app.config['MYSQL_DATABASE_DB'] = 'app'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)

conn = mysql.connect()
cursor = conn.cursor()

class ContactGroup(Model):
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

    def __repr__(self):
        return self.name


class Gender(Model):
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique = True, nullable=False)

    def __repr__(self):
        return self.name


class Contact(Model):
    id = Column(Integer, primary_key=True)
    name =  Column(String(150), unique = True, nullable=False)
    address = Column(String(564))
    birthday = Column(Date, nullable=True)
    personal_phone = Column(String(20))
    personal_celphone = Column(String(20))
    contact_group_id = Column(Integer, ForeignKey('contact_group.id'), nullable=False)
    contact_group = relationship("ContactGroup")
    gender_id = Column(Integer, ForeignKey('gender.id'), nullable=False)
    gender = relationship("Gender")

    def __repr__(self):
        return self.name

    def month_year(self):
        date = self.birthday or mindate
        return datetime.datetime(date.year, date.month, 1) or mindate

    def year(self):
        date = self.birthday or mindate
        return datetime.datetime(date.year, 1, 1)
    
def importCSV(filename, filepath):
    message = "success"
    with open(filepath, "r") as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        tableName = filename.split(".")[0]
        cursor.execute("DROP TABLE IF EXISTS `" + tableName + "`")
        
        header = next(reader)
        createStmt = "CREATE TABLE " + tableName + "("
        
        for col in header:
            createStmt += col + " varchar(255) NOT NULL,"

        createStmt = createStmt + "CONSTRAINT " + tableName + "_pk PRIMARY KEY (" + header[0] + "));"
        #print(createStmt)               
        cursor.execute(createStmt)
        values = ""
        
        
        
        for row in reader:
            #print(str(header)[1:-1])
            for col in range(0,len(header)):
                values += '"' + row[col] + '",'
            #print(values[:-1])
            cursor.execute('INSERT INTO ' + tableName + '(' + str(header)[1:-1].replace("'","") + ')' \
            'VALUES(' + values[:-1] + ')' \
            )
            values = ""
            conn.commit()
            
        #cursor.close()
        #conn.close()
        csvfile.close()  
        
        return message