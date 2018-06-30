import csv
import re
import json
import random
import string

facebookUrlRegex = '.*facebook.*/(?P<subpath>.*)'
subpathRegex = '.*id=(?P<id>[0-9]+)(\?|&|$)'

def RemoveKnownBadChars(line):
    return line.replace(" ", "").replace("?", "").replace("&", "").replace("heymentor", "").replace("ref=bookmarks", "").replace("profile.php", "").replace("home.php", "")

def ParseSubPath(subpath):
    idMatch = re.match(subpathRegex, subpath, flags=re.I)
    if idMatch: 
        if idMatch.group('id'):
            # Have Id
            return idMatch.group('id')

    return RemoveKnownBadChars(subpath)

def GetCleanFacebookLinks():
    with open('hm_data.csv') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            line = row["Facebook URL (ex: www.facebook.com/heymentor)"]
            usableLine = RemoveKnownBadChars(line)
            regexMatch = re.match(facebookUrlRegex, line, flags=re.I)        
             
            if regexMatch:
                if regexMatch.group('subpath'):
                    # have subpath
                    usableLine = ParseSubPath(regexMatch.group('subpath'))
            
            print(usableLine)            


def CreateMenteesTableEntries():
    with open('C:\\Users\\mattbo\\Desktop\\2017-18 Hey Mentor Student Application.csv\\hm_data_2018.csv') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            person = {}
            person['fname'] = str.strip(row["Legal First Name "]).title()
            person['lname'] = str.strip(row["Legal Last Name"]).title()
            person['kname'] = str.strip(row["Nickname"]).title()
            person['fburl'] = "URL"

            demo = {}
            demo['gender'] = str.strip(row["Gender"]).title()
            demo['race'] = str.strip(row["Race"]).title()
            demo['eth'] = str.strip(row["Ethnicity"]).title()

            school = {}
            highSchoolName = str.strip(row["What high school do you attend? (If it isn't listed above)"]).title()
            if len(highSchoolName) == 0: 
                highSchoolName = str.strip(row["Name of High School "]).title()
            school['name'] =  highSchoolName  
            school['grade'] = str.strip(row["Grade"])
            school['gpa'] = str.strip(row["Cumulative GPA"])
            school['sat'] = str.strip(row["SAT Score"])

            data = {}
            data['mentor_id'] = ''
            data['mentee_id'] = ''.join(random.SystemRandom().choice(string.ascii_lowercase + string.digits) for _ in range(20))
            data['person'] = person
            data['demo'] = demo
            data['school'] = school
            data['support'] = str.strip(row["What areas do you need support in?"]).split(';')
            data['gen_interest'] = str.strip(row["General Area of Interest"])
            data['spec_interest'] = str.strip(row["Interests "]).split(', ')
            data['sports'] = str.strip(row["Sports"]).split(', ')

            tempCurrics = str.strip(row["List all your extracurricular involvements"]).replace(" \n-", ".").replace("\n-", ".").replace("\n", ".").split('.')
            #data['extracurric'] = [s.title() for s in tempCurrics]

            
            # data['hobbies'] = str.strip(row["List all your hobbies & interests"]).replace(" \n-", ".").replace("\n-", ".")
            #data['selfdescript'] = str.strip(row["How would people describe you in three words?"])

            json_data = json.dumps(data, indent=4, sort_keys=True)

            filename = data['mentee_id'] + ".js"
            f = open(filename,'w')
            f.write(json_data)
            f.close()

            #print(json_data)


CreateMenteesTableEntries()


#"Timestamp"
#"Legal First Name"
#"Legal Last Name"
#"Nickname"
#"Date of Birth"
#"Gender"
#"Race"
#"Ethnicity"
#"What is your household income?"
#"Please mark all that apply"
#"Home Address"
#"Preferred Email"
#"Phone Number"
#"Facebook URL (ex: www.facebook.com/heymentor)"
#"How did you hear about Hey Mentor?"
#"Name of High School"     
#"Location: (City, State)"
#"Grade"
#"Cumulative GPA"
#"SAT Score"
#"ACT Score"
#"Intended Major (You may write \"Undecided\" if you don't know)"    
#"What is your plan after high school?"
#"What areas do you need support in?"
#"Are you in a college prep program?"
#"Are you in any college access programs?"
#"List all your extracurricular involvements"
#"List all your hobbies & interests"
#"What are your career goals?"
#"How would people describe you in three words?"
#"Anything else you would like to share?"






