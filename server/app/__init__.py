"""
@author: Beyond Ideas 
"""

import os, datetime, requests

from . import modelbi
from . import check_headers
from urllib.request import urlopen as uReq #for crawling
from bs4 import BeautifulSoup as soup #for crawling
from flask import Flask, render_template, jsonify, json, request, session, Blueprint, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from sqlalchemy import text
from werkzeug.utils import secure_filename
import pandas as pd
import re
import dateparser
import math
from flask_sslify import SSLify
# db variable initialization
db = SQLAlchemy()

# Creating App

def create_app(config_name):
    app = Flask(__name__, static_folder='../../static/dist',
                template_folder='../../static')
    app.config['SQLALCHEMY_DATABASE_URI'] = "mysql://root@127.0.0.1:3306/is480-term1-2018-19"
    app.secret_key='super secret key'
    # App Configurations
    app.config.from_pyfile('config.cfg', silent=True)
    # app.config["CUSTOM_STATIC_PATH"] = "../../static"

    blueprint = Blueprint(
        'site', __name__, static_folder='../../static', template_folder='../../static')
    app.register_blueprint(blueprint)

    # Database Setup
    db.init_app(app)

    # Login Manager Set Up
    login_manager = LoginManager()
    login_manager.init_app(app)

# ========================================================= Common Classes START HERE ================================================

    # Default User loader
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.filter_by(id=user_id).first()
        
    @app.route("/")
    def index():
        if not current_user.is_authenticated:
            return redirect(url_for('login_r'))
        else:
            return render_template('home.html')

    # Default Render
    @app.route('/login')
    def login_r():
        if current_user.is_authenticated:
            return redirect('/')
        else:
            return render_template('login.html')

    # Migrating the db.Models from the Models.py file to MySQL
    migrate = Migrate(app, db)

    from app import models
    from app.models import User, UserData, GroupValidHeaders, UserVisualization, Group, GroupMember, GroupDataset

    # Render Homepage

    @app.route("/upload/")
    def upload():
        if not current_user.is_authenticated:
            return redirect(url_for('login_r'))
        else:
            if current_user.group_id is not None:
                return render_template('upload.html')
            else:
                return render_template('upload_nogroup.html')

    @app.route("/visualisation/")
    def visualisation():
        if not current_user.is_authenticated:
            return redirect(url_for('login_r'))
        else:
            return render_template('visualisation.html')

    @app.route("/manage/")
    def manage():
        if not current_user.is_authenticated:
            return redirect(url_for('login_r'))
        else:
            return render_template('manage.html')

    @app.route("/datasets/")
    def datasets():
        if not current_user.is_authenticated:
            return redirect(url_for('login_r'))
        else:
            return render_template('datasets.html')

    @app.route('/signup')
    def signup_r():
        return render_template('signup.html')

    @app.route('/upload/edit_table')
    def edit_table():
        if current_user.is_authenticated:
            return render_template('editTable.html')
        else:
            redirect(url_for('login_r'))
    
    # upload file settings
    UPLOAD_FOLDER = 'app/uploads'
    ALLOWED_EXTENSIONS = set(['txt', 'csv'])

    app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

    def allowed_file(filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
# ========================================================= API START HERE ================================================

    @app.route('/register_api', methods=['POST'])  # API - User Registration
    def register():
        req_body = request.get_json()
        email = req_body['email']
        password = req_body['password']
        firstname = req_body['firstName']
        lastname = req_body['lastName']

        emailExist = User.query.filter_by(email=email).first()
        if emailExist:
            return jsonify({'status': 400, 'error': 'Email Exists'})
        else:
            user = models.User(email=email, fullname=(
                firstname+' '+lastname), password=password)
            db.session.add(user)
            db.session.commit()
            login_user(user)
            return jsonify({'status': 200})

    @app.route('/login_api', methods=['POST'])  # API -> User Login
    def login():
        req_body = request.get_json()
        email = req_body['email']
        password = req_body['password']
        if email == '' or password == '':
            return jsonify({'status': 400})
        user = User.query.filter_by(email=email).first()
        if user:
            check = user.verify_password(password)
            if check:
                login_user(user)
                return jsonify({'status': 200})

        return jsonify({'status': 400})

    @app.route('/logout_api')  # API -> User Log Out
    #@login_required
    def logout():
        logout_user()
        # return jsonify({
        #     'status': 200'
        # })
        return redirect(url_for('login_r'))

    @app.route('/getSession_api')  # API -> get Current User if available
    def getSession():
        if current_user.is_authenticated:
            return jsonify({
                'status': 200,
                'current_user': {
                    'name': current_user.fullname,
                    'email': current_user.email,
                }
            })
        else:
            return jsonify({'status': 400})



    @app.route('/upload_api', methods=['GET', 'POST'])  # API for upload
    def upload_file():
        # if current_user.is_authenticated:
        if 'editData' in session:
            session.pop('editData')
        if request.method == 'POST':
            # check if the post request has the file part
            if 'file' not in request.files:
                # flash('No file part')
                return jsonify({'status':402, 'error':'No File Part'})
            file = request.files['file']
            # if user does not select file, browser also
            # submit an empty part without filename
            if file.filename == '':
                # flash('No selected file')
                return jsonify({'status':401, 'error':'No Selected File'})
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                session['filePath'] = 'app/uploads/' + filename
                session['fileName'] = filename
                valid = GroupValidHeaders.query.filter_by(group_id=current_user.group_id).all()
                valid_headers=[]
                header_types ={}
                for row in valid:
                    valid_headers.append(row.header_name)
                    header_types[row.header_name] = row.data_type
                value = json.loads(check_headers.suggest_headers('app/uploads/' + filename, valid_headers, header_types, filename))

                if value['status'] == 400:
                    session['editData'] = value
                    return jsonify(value)
                else:
                    f = filename[0:len(filename) - 4]+ "_" +str(current_user.id)
                    has = UserData.query.filter_by(data_name=f).first()
                    print(value)
                    if has is None:
                        header = "("
                        headerNoType ="("
                        headerOrder = []
                        dateIndex = []
                        d = 0
                        for k,v in value['headers'].items():
                            header = header + k + " "
                            headerNoType += k + ","
                            headerOrder.append(k)
                            if(v == 'int'):
                                header = header + "INT"
                            elif(v == 'text'):
                                header = header + "TEXT"
                            elif(v == 'date'):
                                header = header + "DATETIME"
                                dateIndex.append(d)
                            elif(v == 'double' or v == 'float'):
                                header = header + "FLOAT"
                            header = header + ','
                            d = d + 1
                        header = header[0:len(header)-1] +')'
                        sql = f'CREATE TABLE {filename[0:len(filename)-4]+"_"+str(current_user.id)} {header}'
                        insertSQL = f'INSERT INTO {filename[0:len(filename)-4]+"_"+str(current_user.id)} {headerNoType[0: len(headerNoType) - 1] + ")"} VALUES '
                        v=""
                        for item in json.loads(value['data']):
                            v = v + "("
                            for el in range(len(headerOrder)):
                                i = item[headerOrder[el]]
                                if i is None:
                                    v = v + "NULL,"
                                else:
                                    if el in dateIndex:
                                        i = convertToDate(i)
                                        if i is None:
                                            v = v + "NULL,"
                                        else:
                                            v = v + "'" +str(i) + "',"
                                    else:
                                        v = v + "'" +str(i) + "',"
                            v = v[0: len(v) - 1] + "),"

                        insertSQL += v[0:len(v) - 1] +";"
                        db.engine.execute(text(sql))
                        db.engine.execute(text(insertSQL))
                        userData = UserData(data_name=f, user_id=current_user.id, upload_date=datetime.datetime.now())
                        db.session.add(userData)
                        db.session.commit()
                        # if os.path.join(app.config['UPLOAD_FOLDER']).exists(filename):
                        #     os.path.join(app.config['UPLOAD_FOLDER']).remove(filename)
                        return jsonify({"status":200})
                    else:
                        return jsonify({"status":400, "error": "Dataset exists"})

        else:
            return jsonify({'status': 404, 'error': 'Use POST request'})
        # else:
        #     return jsonify({})
    
    
    @app.route('/get_all_dataset_api')
    def get_all_dataset_api():
        if current_user.is_authenticated:
            c_id = current_user.id
            ds_names = UserData.query.filter_by(user_id=c_id).order_by(UserData.upload_date.desc()).all()
            returnList =[]
            for dd in range(len(ds_names)):
                d = ds_names[dd]
                temp = {}
                temp["id"] = f'dataset-name-{dd+1}'
                temp["name"] = d.data_name
                returnList.append(temp)
                # # print(returnList)
            return jsonify({'datasetNames':returnList})
        else:
            return jsonify({'status':400})


    @app.route('/get_headers_api', methods=['POST'])
    def get_headers_api():
        if current_user.is_authenticated:
            req = request.get_json()
            dataset = req['selectedData']
            headers = db.engine.execute(f'Show columns from {dataset}')
            head_list = [row[0] for row in headers]
            return jsonify({'status':200, 'headers': head_list})
        return jsonify({'status':400})

    @app.route('/get_headers_unique_values_api', methods=['POST'])
    def get_headers_unique_values_api():
        if current_user.is_authenticated:      
            req = request.get_json()
            # # print("Request", req)
            dataset = req['dataset']
            # # print("DATASET::: ", dataset)
            col = req['column']
            # # print("COLUMN::: ", col)
            sql_data = db.engine.execute(f'Select distinct {col} from {dataset} ORDER BY {col} ASC')
            result = []
            # # print("DATA::: ", sql_data)
            for row in sql_data:
                result.append(row[0])
            return jsonify({'status':200, 'data': result})
        return jsonify({'status':400})
        
    def fixDate(dateStr):
        dateObj = { 'Jan' : 1, 'Feb' : 2, 'Mar' : 3, 'Apr' : 4, 'May' : 5, 'Jun' : 6, 'Jul' : 7, 'Aug' : 8, 'Sep' : 9, 'Oct' : 10, 'Nov' : 11, 'Dec' : 12}
        dateList = dateStr.split(" ")
        date = datetime.date(int(dateList[3]), int(dateObj[dateList[2]]), int(dateList[1]))
        return date
    
    @app.route('/viz_filter_api', methods=["POST"])
    def viz_filter_api():
        
        def sortConvert(direction):
            return {
                "ascending": "ASC",
                "descending": "DESC"
            }[direction]
        
        def fixDate(dateStr):
            dateObj = { 'Jan' : 1, 'Feb' : 2, 'Mar' : 3, 'Apr' : 4, 'May' : 5, 'Jun' : 6, 'Jul' : 7, 'Aug' : 8, 'Sep' : 9, 'Oct' : 10, 'Nov' : 11, 'Dec' : 12}
            dateList = dateStr.split(" ")
            date = datetime.date(int(dateList[3]), int(dateObj[dateList[2]]), int(dateList[1]))
            return date

        
        if current_user.is_authenticated:
            valid = GroupValidHeaders.query.filter_by(group_id=current_user.group_id).all()
            header_types ={}
            for row in valid:
                header_types[row.header_name] = row.data_type

            req = request.get_json()

            dataset = req['selectedData']
            x_axis = req['headers'][0]
            y_axis = req['headers'][1]
            aggre = req['aggregate']
            filters = req['filter']
            
            conditions = ""
            if len(filters) > 0:
                conditions = "WHERE "
                for f in filters:
                    if header_types[f['column']] == 'date':
                        val = fixDate(f['value'])
                        # # print(val)
                        conditions += f['column'] + " " + f['condition'] + " '" + str(val) + "' AND "
                    else:
                        conditions += f['column'] + " " + f['condition'] + " '" + f['value'] + "' AND "
                conditions = conditions[0: len(conditions) - 4]
            else:
                conditions = ""


            orderBy = ""
            if (req['topKSort'] is not None):
                topKSort = sortConvert(req['topKSort'])
                orderBy = f'ORDER BY y_axis {topKSort}, {x_axis} ASC'
            else:
                orderBy = f'ORDER BY {x_axis} ASC'


            limitResult = ""
            if (req['topKLimit'] is not None):
                topKLimit = req['topKLimit']
                limitResult = f'LIMIT {topKLimit}'
            else:
                limitResult = ""

            sql = f'SELECT {x_axis}, {aggre}({y_axis}) as y_axis FROM {dataset} {conditions} GROUP BY {x_axis} {orderBy} {limitResult}'

            returnSQL = db.engine.execute(sql)
            returnDict = {}
            returnDict["xaxis"] = []
            returnDict["yaxis"] = []
            for row in returnSQL:
                returnDict["xaxis"].append(str(row[0]))
                returnDict["yaxis"].append(float(row[1]))
            
            if len(returnDict["xaxis"]) == 0 or len(returnDict["yaxis"]) == 0:
                return jsonify({'status':400, 'error': "Filters Invalid"})
            return jsonify({'data': returnDict, 'status': 200})

        return jsonify({'status':400})
    
    @app.route("/update_api")
    def update_api():
        # # print("here")
        if 'editData' not in session or session['editData'] == None:
            return jsonify({"status":500})
        else:
            value = session.get('editData')
            return jsonify(value)

    def convertToDate(i):
        dateList = []
        date = ""
        if(re.match("(^(((0[1-9]|1[0-9]|2[0-8])[\/\-\.](0[1-9]|1[012]))|((29|30|31)[\/\-\.](0[13578]|1[02]))|((29|30)[\/\-\.](0[4,6,9]|11)))[\/\-\.](19|[2-9][0-9])\d\d$)|(^29[\/\-\.]02[\/\-\.](19|[2-9][0-9])(00|04|08|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96)$)",i)):
            if("-" in i):
                dateList = i.split("-")
            elif("/" in i):
                dateList = i.split("/")
            date = datetime.date(int(dateList[2]), int(dateList[1]), int(dateList[0]))
        elif(re.match("^\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9]))$",i)):
            if("-" in i):
                dateList = i.split("-")
            elif("/" in i):
                dateList = i.split("/")
            date = datetime.date(int(dateList[0]), int(dateList[1]), int(dateList[2]))
        else:
            dateList = i.split('/')
            date = datetime.date(int(dateList[2]), int(dateList[1]), int(dateList[0]))
        if len(dateList) != 3:
            return None
        
        return date

    @app.route('/finalize_headers_api', methods=['POST'])  # API for the final headers
    def finalize_headers_api():
        headers_dict = request.get_json()
        filePath = session.get('filePath')
        filename = session.get('fileName')

        df = pd.read_csv(filePath)
        df.columns = df.columns.str.replace(' ', '_')
        
        to_drop = []
        rename_dict = {}

        for key, value in headers_dict.items():
            if len(value) == 0:
                to_drop.append(key)
            else:
                rename_dict[key] = value

        df.drop(columns=to_drop, axis=1, inplace=True)
        df.rename(columns=rename_dict, inplace=True)

        sql = f'SELECT header_name FROM group_valid_headers WHERE data_type="date"'
        result_date = db.engine.execute(text(sql))

        sql2 = f'SELECT header_name FROM group_valid_headers WHERE data_type="float"'
        result_float = db.engine.execute(text(sql2))

        #HOW TO QUERY WHICH ARE THE DATE COLUMNS INSTEAD?
        date_columns = []

        for row in result_date:
            date_columns.append(row['header_name'])

        for column in date_columns:
            if column in df.columns:
                df[column] = df[column].astype(str)
                df[column] = [dateparser.parse(x) for x in df[column] if x != 'NaN']

        float_columns = []

        for row in result_float:
            float_columns.append(row['header_name'])

        for column in float_columns:
            if column in df.columns:
                df[column] = [round(x,2) for x in df[column]]

        df.to_sql(name = filename[0:len(filename)-4]+"_"+str(current_user.id), con=db.engine, index=False)

        userData = UserData(data_name=filename[0:len(filename)-4]+"_"+str(current_user.id), user_id=current_user.id, upload_date=datetime.datetime.now())
        db.session.add(userData)
        db.session.commit()
        os.remove(filepath)
        return jsonify({'status':200})

    @app.route('/view_data_api', methods=["GET"])
    def view_data_api():
        filePath = session.get('filePath')
        filename = session.get('fileName')

        df = pd.read_csv(filePath)

        df = df.head()

        dic = {}
        s = [list(l) for l in zip(*df.values)]
        i = 0
        for row in s:
            dic[df.columns[i]] = row
            i = i + 1

        toReturn = [(k,v) for k,v in dic.items()]
        return jsonify({'data': toReturn})

    @app.route('/save_visualization', methods=["POST"])
    def save_visualization():
        userID = current_user.id
        userViz = UserVisualization(upload_date=datetime.datetime.now(), configs=request.get_json(),user_id=userID, viz_name=request.get_json()['vizName'])
        db.session.add(userViz)
        db.session.commit()
        return jsonify({'status':200})

    @app.route('/get_all_saved_viz')
    def get_all_saved_viz():
        userID = current_user.id
        res = UserVisualization.query.filter_by(user_id=userID).order_by(UserVisualization.upload_date.desc()).all()
        returnList = []
        for item in res:
            temp = {}
            temp[str(item.viz_name)] = item.configs
            returnList.append(temp)
        
        return jsonify({'data':returnList, 'status': 200})

    @app.route('/has_group')
    def has_group():
        if current_user.isManager == 1:
            if current_user.group_id is not None:
                return jsonify({
                    'status': 300,
                    'group_id': current_user.group_id,
                    'managerId': current_user.id
                })
            else:
                return jsonify({
                    'status': 301,
                })
        else:
            if(current_user.group_id is not None):
                returnObj = {}
                returnObj['status'] = 200
                group = Group.query.filter_by(id=current_user.group_id).first()
                returnObj['managerId'] = group.manager_id
                members = GroupMember.query.filter_by(group_id=current_user.group_id).all()
                returnObj['numMember'] = len(members)
                returnObj['group_id'] = current_user.group_id
                return jsonify(returnObj)
        return jsonify({'status':400})

    @app.route('/get_manager_info',methods=["POST"])
    def get_manager_info():
        dic = request.get_json()
        manager_id = dic['manager_id']
        man = User.query.filter_by(id=manager_id).one()
        returnDict = {}
        returnDict['name'] = man.fullname
        returnDict['email'] = man.email
        returnDict['status'] = 200
        return jsonify(returnDict)
        
    @app.route('/get_group_user_dataset')
    def get_group_user_dataset():
        if current_user.is_authenticated:
            c_id = current_user.id
            g_id = current_user.group_id
            ds_names = UserData.query.filter_by(user_id=c_id).order_by(UserData.upload_date.desc()).all()
            gds_names = GroupDataset.query.filter_by(group_id=g_id).order_by(GroupDataset.upload_date.desc()).all()
            yourList =[]
            gList = []
            for dd in range(len(ds_names)):
                d = ds_names[dd]
                yourList.append(d.data_name)

            for dd in range(len(gds_names)):
                d = gds_names[dd]
                gList.append(d.data_name)

            return jsonify({'yourData':yourList,'groupData':gList, 'status':200})
        else:
            return jsonify({'status':400})

    @app.route('/push_to_group', methods=["post"])
    def push_to_group():
        d = request.get_json()
        dsname = d['data_name']
        has = GroupDataset.query.filter_by(data_name=dsname).first()
        if has is None:
            g_id = current_user.group_id
            groudDS = GroupDataset(group_id=g_id,data_name=dsname, upload_date=datetime.datetime.now())
            db.session.add(groudDS)
            db.session.commit()
            return jsonify({'status':200})
        else:
            return jsonify({'status':400})

    @app.route('/get_all_groups')
    def get_all_groups():
        groups = Group.query.all()
        returnList = []
        for data in groups:
            temp = {}
            temp['id'] = data.group_name
            temp['manager_id'] = data.manager_id
            returnList.append(temp)

        return jsonify({'data':returnList, 'status':200})

    @app.route('/create_groups', methods=["POST"])
    def create_groups():
        req = request.get_json()
        g_name = req['groupname']
        has = Group.query.filter_by(group_name=g_name).first()
        if has:
            return jsonify({'status': 400})
        
        group = Group(group_name=g_name, manager_id=current_user.id)
        db.session.add(group)
        db.session.commit()

        g_id = Group.query.filter_by(group_name=g_name).first()
        datas = req['data']
        for data in datas:
            vh = GroupValidHeaders(group_id = g_id.id, header_name = data['header'], data_type = data['type'])
            db.session.add(vh)
            db.session.commit()

        db.engine.execute(text(f"UPDATE `user` SET group_id = {g_id.id} where id={current_user.id}"))
        return jsonify({
            'status' : 200
        })
    
    @app.route('/apply_to_group', methods=['POST'])
    def apply_to_group():
        data = request.get_json()
        groupName = data['group_name']
        groupId = Group.query.filter_by(group_name=groupName).first()
        db.engine.execute(text(f"UPDATE `user` SET group_id = {groupId.id} where id={current_user.id}"))
        groupMember =GroupMember(group_id=groupId.id, user_id=current_user.id)
        db.session.add(groupMember)
        db.session.commit()
        return jsonify({'status':200})

    @app.route('/get_valid_headers')
    def get_valid_headers():
        valid = GroupValidHeaders.query.filter_by(group_id=current_user.group_id).all()
        toRet = [[row.header_name, row.data_type] for row in valid]
        return jsonify({'data':toRet})

    @app.route('/get_num_group_members')
    def get_num_group_members():
        members = GroupMember.query.filter_by(group_id=current_user.group_id).all()
        return jsonify({'member': len(members)})

    @app.route('/get_data_for_export', methods=['POST'])
    def get_data_for_export():
        dic = request.get_json()
        ds = dic['dataset']
        headers = db.engine.execute(f'Show columns from {ds}')
        head_list = [row[0] for row in headers]
        sql = db.engine.execute(text(f'SELECT * FROM {ds}'))
        data = []
        data.append(head_list)
        s= [row for row in sql]
        i = 0
        for row in s:
            temp = []
            for val in row:
                if isinstance(val, datetime.datetime):
                    val = str(val)
                temp.append(val)
            data.append(temp)
        return jsonify({'data':data,'status':200})


    @app.route('/get_entities_from_dataset_api', methods=['POST'])
    def get_entities_from_dataset_api():
        dic = request.get_json()
        ds = dic['dataset']
        headers = db.engine.execute(f'Show columns from {ds}')
        head_list = [row[0] for row in headers]
        valid = GroupValidHeaders.query.filter_by(group_id=current_user.group_id).all()
        validHeaders= []
        for row in valid:
            if row.isCategory == True:
                validHeaders.append(row.header_name)

        validHeaders = set(validHeaders)
        toRet = []
        for head in head_list:
            if head in validHeaders:
                toRet.append(head)
        
        return jsonify({'data': toRet, 'status': 200})

    @app.route('/get_prebuilt_analysis', methods=['POST'])
    def get_prebuilt_analysis():
        req = request.get_json()
        dataset = req['dataset']
        entity = req['entity']
        analysis = req['analysis']
        headers = db.engine.execute(f'Show columns from {dataset}')
        head_list = [row[0] for row in headers]
        valid = GroupValidHeaders.query.filter_by(group_id=current_user.group_id).all()
        validHeaders= []
        for row in valid:
            if row.isCategory == False and (row.data_type == 'int' or row.data_type == 'float'):
                validHeaders.append(row.header_name)

        validHeaders = set(validHeaders)
        values = []
        for head in head_list:
            if head in validHeaders:
                values.append(head)

        data = {}
        for item in values:
            returnSQL = db.engine.execute(text(f'SELECT AVG({item}), {entity} FROM {dataset} GROUP BY {entity} ORDER BY AVG({item}) DESC LIMIT 10'))
            
            returnDict = {}
            returnDict["xaxis"] = []
            returnDict["yaxis"] = []
            
            for row in returnSQL:
                returnDict["xaxis"].append(str(row[1]))
                returnDict["yaxis"].append(float(row[0]))
            
            data[item] = returnDict

        return jsonify({'headers': values, 'values':data})

        
# ========================================================= Beyond-Ideas Classes START HERE ================================================

    class TableClassbi():
        """
            This is the table view page
        """ 
        @app.route('/')     
        @app.route('/tablepagebi/')
        def tablepagebi(): #rendering our table view page
            """
                This method will render our table view page
            """      
            if not current_user.is_authenticated:
                return redirect(url_for('login_r'))
            else:
                return render_template('tablepagebi.html')            

        @app.route('/tableviewbi/', methods = ['POST'])
        def tableviewbi(): #retrieving table display for API call from react      
            """
                This method will retrieve table display for API call from react 
            """           
            tablename = request.form.get("tablename") 

            usertablename = ""
            if current_user.is_authenticated:      
                usertablename = tablename + "_" + str(current_user.id)       
            
            table = modelbi.displayTablebi(usertablename)

            return jsonify(
                colnames = table[0],
                coldata = table[1]
            )
             
        @app.route('/savejoinedtablebi/', methods = ['POST'])
        def savejoinedtablebi(): #retrieving combined table for API call from react
            """
                This method will retrieve table display for API call from react 
            """   
            usertablename = request.form.get("tablename1")+ "_" + str(current_user.id) 
            usertablename2 = request.form.get("tablename2")+ "_" + str(current_user.id) 
			
            joinvariable = request.form.get("selectedjoinvariable")

            combinedtablename = request.form.get("filename")+ "_" + str(current_user.id) 
			
            variablelist = modelbi.getAllColumnNamebi(usertablename)
            variablelist2 = modelbi.getAllColumnNamebi(usertablename2)
			
            for n, variable in enumerate(variablelist):
                for n2, variable2 in enumerate(variablelist2):
                    variable2 = variable2
                    if variablelist[n] == variablelist2[n2]:
                        variablelist[n] = "t1."+variable+" as "+variable+"1"
                        variablelist2[n2] = "t2."+variable2+" as "+variable2+"2"
                
            variableset = set(variablelist)
            variableset2 = set(variablelist2)

            variables1 = ",".join(list(variableset))
            variables2 = ",".join(list(variableset2)) 	

            variables = variables1 + "," + variables2	
			
            combinetable = modelbi.tablesViewJoinbi(variables, usertablename, usertablename2, joinvariable, combinedtablename, current_user.id)
			
            combinedtable = modelbi.displayTablebi(combinedtablename)
            
            return jsonify(
                colnames = combinedtable[0],
                coldata = combinedtable[1]
            )
            
    class ChartClassbi():
        """
            This is the chart page
        """ 
        @app.route('/correlationpagebi/')
        def correlationpagebi(): #rendering our correlation page
            """
                This method will render our correlation page
            """     
            if not current_user.is_authenticated:
                return redirect(url_for('login_r'))
            else:
                return render_template('correlationpagebi.html')        


        @app.route('/chartpagebi/')
        def chartpagebi(): #rendering our chart page
            """
                This method will render our chart page
            """     
            if not current_user.is_authenticated:
                return redirect(url_for('login_r'))
            else:
                return render_template('chartpagebi.html')
        
        @app.route('/variablesbi/', methods = ['POST'])
        def variablesbi(): #retrieving variables for API call from react
            """
                This method will retrieve variables for API call from react
            """       
            tablename = request.form.get("tablename")

            if current_user.is_authenticated:      
                usertablename = tablename + "_" + str(current_user.id)   

            variablelist = modelbi.getNumericalColumnNamebi(usertablename)    
            
            datevariablelist = modelbi.getDateColumnNamebi(usertablename)  
            companyvariablelist = modelbi.getCompanyColumnNamebi(usertablename)  
            depotvariablelist = modelbi.getDepotColumnNamebi(usertablename)  
            countrynamevariablelist = modelbi.getCountryNameColumnNamebi(usertablename)  

            companyvaluelist = modelbi.getCompanyValuesbi(usertablename) 
            depotvaluelist = modelbi.getDepotValuesbi(usertablename)
            countrynamevaluelist = modelbi.getCountryNameValuesbi(usertablename)                 
            
            return jsonify(
                variablelist = variablelist,            
                datevariablelist = datevariablelist,
                companyvariablelist = companyvariablelist,
                depotvariablelist = depotvariablelist,
                countrynamevariablelist = countrynamevariablelist,
                companyvaluelist = companyvaluelist,
                depotvaluelist = depotvaluelist,
                countrynamevaluelist = countrynamevaluelist,
               
            )
        
        @app.route('/filtervariablebi/', methods = ['POST'])
        def filtervariablebi():
            tablename = request.form.get("tablename")
            tablename2 = request.form.get("tablename2")

            if current_user.is_authenticated:      
                usertablename = tablename + "_" + str(current_user.id)   
                usertablename2 = tablename2 + "_" + str(current_user.id) 

            filtervariable = request.form.get("selectedfiltervariable")
            
            filtervalueslist = modelbi.getFilterValuesbi(usertablename, usertablename2, filtervariable)
            
            return jsonify(
                filtervalueslist = filtervalueslist
            )
            
        @app.route('/scatterplotdatabi/', methods = ['POST'])
        def scatterplotdatabi(): #retrieving mysql data for API call from react
            """
                This method will retrieve mysql data for API call from react
            """     
            tablename = request.form.get("selectedtable")  
            tablename2 = request.form.get("selectedtable2")   

            if current_user.is_authenticated:      
                usertablename = tablename + "_" + str(current_user.id)   
                usertablename2 = tablename2 + "_" + str(current_user.id)             

            variablenameX = request.form.get("selectedvariable")  
            variablenameY = request.form.get("selectedvariable2") 

            joinvariable = request.form.get("selectedjoinvariable") 

            filtervalue = request.form.get("selectedfiltervalue")
            filtervalue2 = request.form.get("selectedfiltervalue2")               
            
            filtervariable = request.form.get("selectedfiltervariable")

            combinedxyarray = modelbi.tablesJoinbi(usertablename, usertablename2, variablenameX, variablenameY, joinvariable, filtervalue, filtervalue2, filtervariable)

            return jsonify(
                xarray = combinedxyarray[0],
                yarray = combinedxyarray[1]
            )
   

    class AutoChartClassbi():
        """
            This is the chart page
        """      
        @app.route('/autochartpagebi/')
        def autochartpagebi(): #rendering our chart page
            """
                This method will render our auto chart page
            """     
            if not current_user.is_authenticated:
                return redirect(url_for('login_r'))
            else:
                return render_template('autochartpagebi.html')
        
        @app.route('/autoscatterplotdatabi/', methods = ['POST'])
        def autoscatterplotdatabi(): #retrieving mysql data for API call from react
            """
                This method will retrieve mysql data for API call from react
            """     
            tablename = request.form.get("selectedtable")  
            tablename2 = request.form.get("selectedtable2")

            if current_user.is_authenticated:      
                usertablename = tablename + "_" + str(current_user.id)   
                usertablename2 = tablename2 + "_" + str(current_user.id)             

            variablenameX = request.form.get("selectedvariables1")[1:-1].split(",")
            variablenameY = request.form.get("selectedvariables2")[1:-1].split(",")

            joinvariable = request.form.get("selectedjoinvariable") 
            filtervalue = request.form.get("selectedfiltervalue")
            filtervalue2 = request.form.get("selectedfiltervalue2")               
            
            filtervariable = request.form.get("selectedfiltervariable")
            
            allcombinedxyarrays = []
            for x in variablenameX:
                for y in variablenameY:
                    combinedxyarray = modelbi.tablesJoinbi(usertablename, usertablename2, x, y, joinvariable, filtervalue, filtervalue2, filtervariable)
                    allcombinedxyarrays.append(combinedxyarray)
            return jsonify(
                allcombinedxyarrays
            )
       
     
    class WebCrawlingClassbi():
        """
            This is the web crawling page
        """ 
        @app.route("/webcrawlingpagebi/")
        def webcrawlingpagebi(): #rendering our web crawling page
            """
                This method will render our web crawling page
            """      
            if not current_user.is_authenticated:
                return redirect(url_for('login_r'))
            else:
                return render_template('webcrawlingpagebi.html')

        @app.route("/weathercrawlingpagebi/")
        def weathercrawlingpagebi(): #rendering our weather crawling page
            """
                This method will render our weather crawling page
            """      
            if not current_user.is_authenticated:
                return redirect(url_for('login_r'))
            else:
                return render_template('weathercrawlingpagebi.html')                
        
        @app.route("/weathercrawlingbi/", methods = ['POST'])
        def weathercrawlingbi(): 
            """
                This method will crawl weather
            """           
            startdate = request.form.get("startdate")  
            enddate = request.form.get("enddate")   

            countryname = request.form.get("countryname") 
            saveToDB = request.form.get("save") 
            filename = request.form.get("filename")               

            message = modelbi.weatherCrawlerbi(startdate, enddate, countryname, saveToDB, current_user.id, filename)
            return jsonify(
                message = message
            )

        @app.route("/twittercrawlingpagebi/")
        def twittercrawlingpagebi(): #rendering our twitter web crawling page
            """
                This method will render our twitter web crawling page
            """      
            if not current_user.is_authenticated:
                return redirect(url_for('login_r'))
            else:               
                return render_template('twittercrawlingpagebi.html')         

        @app.route("/twittercrawlingbi/", methods = ['POST'])
        def twittercrawlingbi(): 
            """
                This method will crawl twitter
            """      
            tags = request.form.get("tags")  
            nooftweets = request.form.get("nooftweets") 
            datebefore = request.form.get("datebefore")             
            saveToDB = request.form.get("save") 
            filename = request.form.get("filename")                         

            results = modelbi.twitterCrawlerbi(tags, nooftweets, datebefore, saveToDB, current_user.id, filename)

            return jsonify(
                tweets = results[0],
                apicalllimit = results[1],
                apicallreset = results[2]
            )

        @app.route("/stockcrawlingpagebi/")
        def stockcrawlingpagebi(): #rendering our stock crawling page
            """
                This method will render our stock crawling page
            """      
            if not current_user.is_authenticated:
                return redirect(url_for('login_r'))
            else:
                return render_template('stockcrawlingpagebi.html') 

        @app.route("/stockcrawlingbi/", methods = ['POST'])
        def stockcrawlingbi(): 
            """
                This method will crawl stock
            """            
            stockname = request.form.get("stockname") 
            saveToDB = request.form.get("save") 
            filename = request.form.get("filename")               

            message = modelbi.stockCrawlerbi(stockname, saveToDB, current_user.id, filename)
            return jsonify(
                message = message
            )            

    class AnalysisClassbi():
        """
            This is the analysis page
        """        
        @app.route("/analysispagebi/")
        def analysispagebi(): #rendering our analysis page
            """
                This method will render our analysis page
            """      
            if not current_user.is_authenticated:
                return redirect(url_for('login_r'))
            else:
                return render_template('analysispagebi.html')

        @app.route("/generateplotbi/", methods = ['POST'])
        def generateplotbi():
            """
                This method will render our analysis charts
            """    
            tablename = request.form.get("selectedtable") 

            usertablename = ""
            if current_user.is_authenticated:      
                usertablename = tablename + "_" + str(current_user.id)   

            tableName = modelbi.sentimentAnalysis(tablename, usertablename, current_user.id)

            results = modelbi.getSentimentDataForTableDisplay(tableName)

            aggregatedsentiment = modelbi.getSentimentDataForChart(tableName) 

            columns = results[0] #column names
            columns[3] = "sentiment score" #rename column name for easier reading
            values = results[1] #all values

            #retrieve top positive & negative words for sentiment wordcloud
            topwords_positive = modelbi.gettopn_words(tableName, 1, 30);
            topwords_negative = modelbi.gettopn_words(tableName, 0, 30);

            #topic modeling overall result 
            results2 = modelbi.topicModeling(tablename, usertablename, current_user.id) 
            #results3 = modelbi.topicModeling2(tablename, usertablename, current_user.id) 

            topiccolumns = results2[0]
            topicvalues = results2[1]

            return jsonify(
                columns = columns,
                values = values,
                aggregatedsentiment = aggregatedsentiment,
                topiccolumns = topiccolumns,
                topicvalues = topicvalues,
                topwords_positive = topwords_positive,
                topwords_negative = topwords_negative
            )

        @app.route("/twittertrain/", methods = ['POST'])
        def twittertrain(): #train model
            """
                This method will train our model
            """            
            modelbi.trainSentimentAnalysisModels()   

            return ""         

    return app