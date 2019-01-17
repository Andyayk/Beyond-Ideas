"""

@author: Beyond Ideas 

"""

import mysql.connector, datetime

#MySQL Configurations
mydb = mysql.connector.connect(
  host = "localhost",
  user = "root",
  passwd = "",
  database = "app"
)
cursor = mydb.cursor(buffered=True)    

def getMySQLTablesbi():
    """
        This method will get all MySQL tables
    """    
    cursor.execute("USE app")
    cursor.execute("SHOW TABLES")
    tables = []
    for (table_name,) in cursor:
        tables.append(table_name)
    return tables
 
def displayTablebi(table_name):
    """
        This method will display table 
    """      
    try:
        cursor.execute("SELECT * FROM `" + table_name + "`")
        table = ""
        
        for col in cursor.description:
            table += "<th style=\"width:130px; max-width:130px; word-wrap: break-word;\"><center>" + col[0] + "</center></th>"

        for item in cursor:
            table += "<tr>"
            for col in item:
                if isinstance(col, datetime.date):
                    col = col.strftime('%d/%m/%Y')
                table += "<td style=\"width:130px; max-width:130px; word-wrap: break-word;\"><center>" + col + "</center></td>"
            table += "</tr>"        

        return table
    except Exception as e:
        return "Something is wrong with displayTable method"
    
def getVariablesbi(table_name):
    """
        This method will get selected variables data 
    """       
    cols = []
    
    cursor.execute("SELECT * FROM " + table_name + "")
    for col in cursor.description: # add table cols
        cols.append(col[0])   

    return cols

def is_emptybi(any_structure):
    """
        This method will check something is empty or not
    """     
    if any_structure:
        return False
    else:
        return True

def tablesJoinbi(tablename, tablename2, variablenameX, variablenameY, joinvariable, joinvariable2, filterstartdate, filterenddate, selecteddatevariable):
    """
        This method will join tables together
    """ 
    cursor.execute("SELECT t1." + variablenameX + " , t2." + variablenameY + " FROM " + tablename + " as t1 , " + tablename2 + " as t2 WHERE t1." + joinvariable + " = t2." + joinvariable2 + " AND " + selecteddatevariable + " BETWEEN '" + filterstartdate + "' AND '" + filterenddate + "'")    
    
    cols = []
    x = []
    y = []
    for col in cursor.description: # add table cols
        cols.append(col[0])    
    
    for row_data in cursor: #add table rows
        if is_emptybi(row_data[0]):
            x.append(0)
        else: 
            x.append(row_data[0])
        
        if is_emptybi(row_data[1]):    
            y.append(0)
        else:             
            y.append(row_data[1])
      
    combinedxyarray = []
    combinedxyarray.append(x)
    combinedxyarray.append(y)

    return combinedxyarray

def getDateVariablebi(tablename):
    """
        This method will get date variables only
    """ 
    cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND DATA_TYPE = 'date'")

    dates = []

    for row_data in cursor: #add table rows
        dates.append(row_data[0])

    return dates