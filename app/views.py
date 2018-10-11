import calendar, csv, os

from flask import Flask, render_template, request
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder import ModelView, AppBuilder, expose, BaseView, has_access
from flask_appbuilder.charts.views import GroupByChartView
from flask_appbuilder.models.group import aggregate_count
from flask_appbuilder.widgets import FormHorizontalWidget, FormInlineWidget, FormVerticalWidget
from flask_babel import lazy_gettext as _

from app import appbuilder, db
from .models import *

"""
    Create your Views::
    class MyModelView(ModelView):
        datamodel = SQLAInterface(MyModel)
    Next, register your Views::
    appbuilder.add_view(MyModelView, "My View", icon="fa-folder-open-o", category="My Category", category_icon='fa-envelope')
"""

class UploadClass(BaseView):
    
    default_view = 'uploadpage'
    
    @expose('/uploadpage/')
    #@has_access
    def uploadpage(self):
        return self.render_template('uploadpage.html')   

    
    @expose('/upload/', methods=['POST'])    
    def upload(self):
        file = request.files['inputFile']

        message =  importCSV(file.filename, os.getcwd() + "\\" + file.filename)   
        return self.render_template('successpage.html', message = message)   
    
class DownloadClass(BaseView):
    
    default_view = "downloadpage"
    
    @expose('/downloadpage/', methods=['GET'])
    def downloadpage(self):
        tables = exportCSV()
        return self.render_template('downloadpage.html', tables=tables)  
    
    @expose('/export/', methods=['POST'])    
    def export(self):
        tablename = request.form.get("tablelist")
        #print(tablename)
        message = writeCSV(tablename)
        return self.render_template('successpage.html', message = message)  

def fill_gender():
    try:
        db.session.add(Gender(name='Male'))
        db.session.add(Gender(name='Female'))
        db.session.commit()
    except:
        db.session.rollback()
     
class ContactModelView(ModelView):
    datamodel = SQLAInterface(Contact)

    list_columns = ['name', 'personal_celphone', 'birthday', 'contact_group.name']

    base_order = ('name', 'asc')
    show_fieldsets = [
        ('Summary', {'fields': ['name', 'gender', 'contact_group']}),
        (
            'Personal Info',
            {'fields': ['address', 'birthday', 'personal_phone', 'personal_celphone'], 'expanded': False}),
    ]

    add_fieldsets = [
        ('Summary', {'fields': ['name', 'gender', 'contact_group']}),
        (
            'Personal Info',
            {'fields': ['address', 'birthday', 'personal_phone', 'personal_celphone'], 'expanded': False}),
    ]

    edit_fieldsets = [
        ('Summary', {'fields': ['name', 'gender', 'contact_group']}),
        (
            'Personal Info',
            {'fields': ['address', 'birthday', 'personal_phone', 'personal_celphone'], 'expanded': False}),
    ]

class GroupModelView(ModelView):
    datamodel = SQLAInterface(ContactGroup)
    related_views = [ContactModelView]

class ContactChartView(GroupByChartView):
    datamodel = SQLAInterface(Contact)
    chart_title = 'Grouped contacts'
    label_columns = ContactModelView.label_columns
    chart_type = 'PieChart'

    definitions = [
        {
            'group' : 'contact_group',
            'series' : [(aggregate_count,'contact_group')]
        },
        {
            'group' : 'gender',
            'series' : [(aggregate_count,'contact_group')]
        }
    ]

def pretty_month_year(value):
    return calendar.month_name[value.month] + ' ' + str(value.year)

def pretty_year(value):
    return str(value.year)

class ContactTimeChartView(GroupByChartView):
    datamodel = SQLAInterface(Contact)

    chart_title = 'Grouped Birth contacts'
    chart_type = 'AreaChart'
    label_columns = ContactModelView.label_columns
    definitions = [
        {
            'group' : 'month_year',
            'formatter': pretty_month_year,
            'series': [(aggregate_count, 'group')]
        },
        {
            'group': 'year',
            'formatter': pretty_year,
            'series': [(aggregate_count, 'group')]
        }
    ]

"""
    Application wide 404 error handler
"""
@appbuilder.app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html', base_template=appbuilder.base_template, appbuilder=appbuilder), 404

db.create_all()

appbuilder.add_view(UploadClass, "Upload Page", category='Upload')
appbuilder.add_view(DownloadClass, "Download Page", category='Download')

fill_gender()
appbuilder.add_view(GroupModelView, "List Groups", icon="fa-folder-open-o", category="Contacts", category_icon='fa-envelope')
appbuilder.add_view(ContactModelView, "List Contacts", icon="fa-envelope", category="Contacts")
appbuilder.add_separator("Contacts")
appbuilder.add_view(ContactChartView, "Contacts Chart", icon="fa-dashboard", category="Contacts")
appbuilder.add_view(ContactTimeChartView, "Contacts Birth Chart", icon="fa-dashboard", category="Contacts")


"""
class MyView(BaseView):  
    
    default_view = 'method1'

    @expose('/method1/')
    #@has_access
    def method1(self):
        # do something with param1
        # and return to previous page or index
        return 'Hello'

    @expose('/method2/<string:param1>')
    #@has_access
    def method2(self, param1):
        # do something with param1
        # and render template with param
        param1 = 'Goodbye %s' % (param1)
        return param1

    @expose('/method3/<string:param1>')
    #@has_access
    def method3(self, param1):
        # do something with param1
        # and render template with param
        param1 = 'Goodbye %s' % (param1)
        self.update_redirect()
        return self.render_template('method3.html',
                               param1 = param1)
                               
appbuilder.add_view(MyView, "Method1", category='My View')
appbuilder.add_link("Method2", href='/myview/method2/john', category='My View')
appbuilder.add_link("Method3", href='/myview/method3/john', category='My View')
"""