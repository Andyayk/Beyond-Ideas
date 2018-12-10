import mysql.connector, csv

#MySQL Configurations
mydb = mysql.connector.connect(
  host = "localhost",
  user = "root",
  passwd = "",
  database = "app"
)
cursor = mydb.cursor(buffered=True)    

#Upload files into MySQL tables  
def uploadCSV(filename, filepath):
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

#Get all MySQL tables
def getMySQLTables():
    cursor.execute("USE app")
    cursor.execute("SHOW TABLES")
    tables = []
    for (table_name,) in cursor:
        tables.append(table_name)
    return tables

#Export MySQL tables into CSV format
def writeToCSV(table_name):
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
                
        return '"' + str(colsString) + '"'
    except Exception as e:
        return "Something is wrong with writeToCSV method"
    
#Display table    
def displayTable(table_name):
    try:
        cursor.execute("SELECT * FROM `" + table_name + "`")
        return cursor
    except Exception as e:
        return "Something is wrong with displayTable method"
    
#Get selected variables data
def getVariables(table_name, table_name2):
    cols = []
    cols2 = []
    
    cursor.execute("SELECT * FROM " + table_name + "")
    for col in cursor.description: # add table cols
        cols.append(col[0])   
        
    cursor.execute("SELECT * FROM " + table_name2 + "")        
    for col in cursor.description: # add table cols
        cols2.append(col[0])          
        
    combinedcolsarray = []
    combinedcolsarray.append(cols)
    combinedcolsarray.append(cols2)
    
    return combinedcolsarray

#Checking something is empty or not
def is_empty(any_structure):
    if any_structure:
        return False
    else:
        return True

#Joining tables together
def tablesJoin(variablename, variablename2, tablename, tablename2):
    cursor.execute("SELECT t1." + variablename + " , t2." + variablename2 + " FROM " + tablename + " as t1 , " + tablename2 + " as t2 WHERE t1.ID = t2.ID")    
    
    cols = []
    x = []
    y = []
    for col in cursor.description: # add table cols
        cols.append(col[0])    
    
    for row_data in cursor: #add table rows
        if is_empty(row_data[0]):
            x.append(0)
        else: 
            x.append(row_data[0])
        
        if is_empty(row_data[1]):    
            y.append(0)
        else:             
            y.append(row_data[1])
      
    combinedxyarray = []
    combinedxyarray.append(x)
    combinedxyarray.append(y)
    
    return combinedxyarray