"""

@author: Beyond Ideas 

"""

import mysql.connector, csv

#MySQL Configurations
mydb = mysql.connector.connect(
  host = "localhost",
  user = "root",
  passwd = "",
  database = "app"
)
cursor = mydb.cursor(buffered=True)    

def uploadCSVbi(filename, filepath):
    """
        This method will upload files into MySQL tables  
    """
    try:
        with open(filepath, "r") as csvfile:
            reader = csv.reader(csvfile, delimiter=',')
            tableName = filename.split(".")[0]
            cursor.execute("DROP TABLE IF EXISTS `" + tableName + "`")
            
            header = next(reader)
            createStmt = "CREATE TABLE " + tableName + "("
            
            for col in header:
                createStmt += col + " varchar(255) NOT NULL,"
            
            createStmt = createStmt + "CONSTRAINT " + tableName + "_pk PRIMARY KEY (" + header[0] + "));"              
            cursor.execute(createStmt)
            values = ""
            
            for row in reader:
                for col in range(0,len(header)):
                    try:
                        values += '"' + row[col] + '",'
                    except ValueError:
                        pass
                cursor.execute('INSERT INTO ' + tableName + '(' + str(header)[1:-1].replace("'","") + ')' \
                'VALUES(' + values[:-1] + ')' \
                )
                values = ""
                mydb.commit()

            csvfile.close()  
            
            return "You have successfully uploaded " + filename + " to the database"
    except Exception as e:
        return "Upload fail, please upload only csv files"

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

def writeToCSVbi(table_name):
    """
        This method will export MySQL tables into CSV format
    """        
    try:
        cursor.execute("SELECT * FROM " + table_name + "")
        cols = []
        colsString = ""
        for col in cursor.description: # add table cols
            cols.append(col[0])
            colsString += str(col[0]) + ","
        colsString = colsString[:-1]

        for col2 in cols: # for each table col
            for row_data in cursor: #add table rows
                row_data = str(row_data).replace("'", "")
                row_data = str(row_data).replace(" ", "")
                colsString += ";" + str(row_data)[1:-1]
                
        return str(colsString)
    except Exception as e:
        return "Something is wrong with writeToCSV method"
 
def displayTablebi(table_name):
    """
        This method will display table 
    """      
    try:
        cursor.execute("SELECT * FROM `" + table_name + "`")
        return cursor
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