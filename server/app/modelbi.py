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

def is_emptybi(any_structure):
    """
        This method will check something is empty or not
    """     
    if any_structure:
        return False
    else:
        return True

def getMySQLTablesbi():
    """
        This method will get all MySQL tables
    """    
    try:
        cursor.execute("USE app")
        cursor.execute("SHOW TABLES")
        tables = []
        for (table_name,) in cursor:
            tables.append(table_name)
        return tables
    except Exception as e:
        return "Something is wrong with getMySQLTablesbi method"    
 
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

def tablesJoinbi(tablename, tablename2, variablenameX, variablenameY, joinvariable, filtervalue, filtervalue2, filtervariable):
    """
        This method will join tables together using date or company or depot or geographical location
    """
    try:
        sqlstmt = "SELECT t1." + variablenameX + " , t2." + variablenameY + " FROM " + tablename + " as t1 , " + tablename2 + " as t2"
        
        if "activitydate" in joinvariable.lower(): #join by date
            sqlstmt = sqlstmt + " WHERE t1." + "date" + " = t2." + "ActivityDate"
        elif "company" in joinvariable.lower(): #join by company
            sqlstmt = sqlstmt + " WHERE t1." + "company" + " = t2." + "company"   
        elif "depot" in joinvariable.lower(): #join by depot
            sqlstmt = sqlstmt + " WHERE t1." + "depot" + " = t2." + "depot"  
        elif "geographicallocation" in joinvariable.lower(): #join by geographical location
            sqlstmt = sqlstmt + " WHERE t1." + "geographicallocation" + " = t2." + "geographicallocation"   

        if "date" in filtervariable.lower(): #filter by date
            sqlstmt = sqlstmt + " AND " + filtervariable + " BETWEEN '" + filtervalue + "' AND '" + filtervalue2 + "'"
        elif "company" in filtervariable.lower(): #filter by company
            sqlstmt = sqlstmt + " AND " + filtervariable + " LIKE '" + filtervalue[3:] + "'"
        elif "depot" in filtervariable.lower(): #filter by depot
            sqlstmt = sqlstmt + " AND " + filtervariable + " = 34"
        elif "geographicallocation" in filtervariable.lower(): #filter by geographical location
            sqlstmt = sqlstmt + " AND " + filtervariable + " LIKE 'Singapore'"                        

        cursor.execute(sqlstmt)

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
    except Exception as e:
        return "Something is wrong with tablesJoinbi method"   

def tablesViewJoinbi(tablename, tablename2, joinvariable):
    """
        This method will join two tables together and save to MySQL database
    """
    try:
        sqlstmt = "CREATE TABLE test AS (SELECT * FROM " + tablename + " as t1 INNER JOIN " + tablename2 + " as t2"
        
        if "activitydate" in joinvariable.lower(): #join by date
            sqlstmt = sqlstmt + " WHERE t1." + "date" + " = t2." + "ActivityDate"
        elif "company" in joinvariable.lower(): #join by company
            sqlstmt = sqlstmt + " WHERE t1." + "company" + " = t2." + "company"   
        elif "depot" in joinvariable.lower(): #join by depot
            sqlstmt = sqlstmt + " ON t1." + "depot" + " = t2." + "SKUKey)"  
        elif "geographicallocation" in joinvariable.lower(): #join by geographical location
            sqlstmt = sqlstmt + " WHERE t1." + "geographicallocation" + " = t2." + "geographicallocation"                       
        # sqlstmt = "CREATE TABLE potlala (id INT NOT NULL PRIMARY KEY, name  VARCHAR(40), email VARCHAR(40))"
        cursor.execute(sqlstmt)

        # table = ""
        
        # for col in cursor.description:
            # table += "<th style=\"width:130px; max-width:130px; word-wrap: break-word;\"><center>" + col[0] + "</center></th>"

        # for item in cursor:
            # table += "<tr>"
            # for col in item:
                # if isinstance(col, datetime.date):
                    # col = col.strftime('%d/%m/%Y')
                # table += "<td style=\"width:130px; max-width:130px; word-wrap: break-word;\"><center>" + col + "</center></td>"
            # table += "</tr>"

        return "test"
    except Exception as e:
        return "Something is wrong with tablesJoinbi method"

def getNumericalColumnNamebi(table_name):
    """
        This method will get selected variables data (numerical variables column names only)
    """    
    try:   
        cols = []
        
        cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + table_name + "' AND DATA_TYPE IN ('TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT', 'DECIMAL', 'FLOAT', 'DOUBLE', 'REAL', 'BIT', 'BOOLEAN', 'SERIAL')")
        for col in cursor: # add table cols
            cols.append(col[0])

        return cols
    except Exception as e:
        return "Something is wrong with getNumericalColumnNamebi method"    
        
def getVarcharColumnNamebi(table_name):
    """
        This method will get selected variables data (numerical variables column names only)
    """    
    try:   
        cols = []
        
        cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + table_name + "' AND DATA_TYPE IN ('VARCHAR', 'date')")
        for col in cursor: # add table cols
            cols.append(col[0])

        return cols
    except Exception as e:
        return "Something is wrong with getNumbericalColumnNamebi method" 

def getDateColumnNamebi(tablename):
    """
        This method will get date variables column names only
    """ 
    try:
        cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND DATA_TYPE = 'date'")

        dates = []

        for col in cursor: #add table cols
            dates.append(col[0])

        return dates
    except Exception as e:
        return "Something is wrong with getDateColumnNamebi method"    

def getCompanyColumnNamebi(tablename):
    """
        This method will get company variables column names only
    """ 
    try:
        cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND COLUMN_NAME LIKE '%company%'")

        dates = []

        for col in cursor: #add table cols
            dates.append(col[0])

        return dates
    except Exception as e:
        return "Something is wrong with getCompanyColumnNamebi method"   

def getDepotColumnNamebi(tablename):
    """
        This method will get depot variables column names only
    """ 
    try:
        cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND COLUMN_NAME LIKE '%depot%'")

        dates = []

        for col in cursor: #add table cols
            dates.append(col[0])

        return dates
    except Exception as e:
        return "Something is wrong with getDepotColumnNamebi method"   

def getGeographicalLocationColumnNamebi(tablename):
    """
        This method will get geographical location variables column names only
    """ 
    try:
        cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '" + tablename + "' AND COLUMN_NAME LIKE '%geographicallocation%'")

        dates = []

        for col in cursor: #add table cols
            dates.append(col[0])

        return dates
    except Exception as e:
        return "Something is wrong with getGeographicalLocationColumnNamebi method"   

def getCompanyVariablesbi(tablename):
    """
        This method will get company variables only
    """ 
    try:
        cursor.execute("SELECT DISTINCT Company FROM " + tablename)

        dates = []

        for col in cursor: #add table cols
            dates.append(col[0])

        return dates
    except Exception as e:
        return ""   