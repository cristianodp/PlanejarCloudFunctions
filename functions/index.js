const functions = require('firebase-functions');
//const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

function getSummary(movments){
    var balanceDayArray = []
    var balanceMonthArray = []
    var movtosMonthArray = []

    var saved   = 0.0
    var balance = 0.0
    var expense = 0.0
    var received = 0.0
    var lastMonth = "1999-01-01"
    
    
    movments.forEach(element => {
        
        const yearMonth = element.date.substr(0,7)+"-01"
        if (yearMonth != lastMonth){
            saved = balance
            //balance = 0.0
            expense = 0.0
            received = 0.0
            lastMonth = yearMonth
            movtosMonthArray = []
        }

        movtosMonthArray.push(element)

        if (element.type === "EXPENCIE"){
            balance -= element.value
            expense += element.value
        }else{
            balance += element.value
            received += element.value
        }
        
        var summary = {"balance": balance
                  ,"expense":expense
                  ,"received":received
                  ,"saved":saved
                  ,"yearMonth":yearMonth
                  ,"movtos":movtosMonthArray}
        balanceDayArray[element.date] = summary
        balanceMonthArray[yearMonth] = summary
    });
    return {"balanceDay": balanceDayArray   
        ,"balanceMonth": balanceMonthArray   
     }
}


function firebaseDataToJsonArray(dataObject){
    const json = dataObject
    const keys = Object.keys(json)
   
    var array = []
    for(x=0;x<keys.length;x++){
        var obj = json[keys[x]]
        array.push(obj)
    }
    if (array.length > 0){
        array = array.sort((a,b)=>{ return a.date > b.date})
    }

    return array
}    

exports.calculateBalance =
    functions.database.ref('profiles/{userID}/movtos')
    .onWrite(event => {
        var post = event.data.val()
        if (post != undefined){
            var arrayMovtos = firebaseDataToJsonArray(post)
            var summary = getSummary(arrayMovtos)
            return event.data.ref.parent.child("summary").set(summary)
        }
        return event
    });
