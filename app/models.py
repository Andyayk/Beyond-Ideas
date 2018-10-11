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
    
def importCSV(filename):
    message = "success"
    with open(filename, "r") as csvfile:
        reader = csv.reader(csvfile, delimiter=',')

        next(reader)
        for row in reader:
            cursor.execute('INSERT INTO inventory_data(id, depot, SKU, customer, activityDate, inventory)'
            'VALUES("' + row[0]+'","'+ row[1]+'","'+ row[2]+'","'+row[3]+'","'+row[4]+'","'+row[5] + '")'
            )
            conn.commit()
            
        cursor.close()
        csvfile.close()  
        
        return message
#"' + data[0]+'","'+ data[1]+'","'+ data[2]+'","'+data[3]+'","'+data[4]+'","'+data[5] + '")' 
            