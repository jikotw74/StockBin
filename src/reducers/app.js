const weekdays = ['週日','週一','週二','週三','週四','週五','週六'];
let days = [];
let daysDateTable = {};
var today = new Date();
var t = 30;
for(var i = -1*t ; i <= t ; i++){
    let d = "";
    var currentDate = new Date();
    if(i === 0){
        d = "今天";
    }else{
        currentDate.setDate(today.getDate() + i);
        d = (currentDate.getMonth()+1) + '月' + currentDate.getDate() + '日 ' + weekdays[currentDate.getDay()];
    }
    days.push(d);
    daysDateTable[d] = currentDate;
}

let hours = [];
for(i = 1 ; i <= 24 ; i++){
    hours.push(i);
}
let mins = [];
for(i = 0 ; i <= 60 ; i+=5){
    if(i < 10){
        mins.push('0'+i);
    }else{
        mins.push(i);    
    }
}

// console.log(days);
// console.log(hours);
// console.log(mins);

window.yyyymmdd = function(date, join) {
    join = join || '';
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();

    return [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join(join);
};

window.parseTrain = function(item, fromStationName, toStationName, date) {
    const stations = window.data.stations;
    if(!fromStationName){
        for(let key in stations){
            if(stations[key] === item['TimeInfo'][0]['$']['Station']){
                fromStationName = key;
            }else if(stations[key] === item['TimeInfo'][item['TimeInfo'].length-1]['$']['Station']){
                toStationName = key;
            }
        }
    }
    const fromStation = stations[fromStationName];
    const toStation = stations[toStationName];

    // calc price
    const priceStations = Object.values(stations);
    let price = 0;
    let priceFrom = priceStations.indexOf(fromStation);
    let priceTo = priceStations.indexOf(toStation);
    if(priceFrom !== -1 && priceTo !== -1){
        const prices = [priceFrom, priceTo].sort((a, b) => a - b);
        price = window.data.priceTable[prices[0]][prices[1]];
    }

    let train = {
        Train: item['$']['Train'],
        fromStation: fromStation,
        fromStationName: fromStationName,
        toStation: toStation,
        toStationName: toStationName,
        fromDepTime: "",
        toArrTime: "",
        dur: "",
        date: date,
        price: price,
        discount: false,
    };

    const getDateSring = (hour, min) => {
        if (min < 10) {
            min = '0' + min;
        }
        return hour + ":" + min;
    }

    item['TimeInfo'].forEach(itemInfo => {
        if (itemInfo['$']['Station'] === fromStation) {
            train.fromDepHour = itemInfo['$']['DEPTime'].substr(0, 2) * 1;
            train.fromDepMin = itemInfo['$']['DEPTime'].substr(2, 2) * 1;
            train.fromDepTime = getDateSring(train.fromDepHour, train.fromDepMin);
        } else if (itemInfo['$']['Station'] === toStation) {
            train.toArrHour = itemInfo['$']['ARRTime'].substr(0, 2) * 1;
            train.toArrMin = itemInfo['$']['ARRTime'].substr(2, 2) * 1;
            train.toArrTime = getDateSring(train.toArrHour, train.toArrMin);
        }
    });

    if (train.fromDepTime.length > 0 && train.toArrTime.length > 0) {
        let fromTime = train.fromDepHour*60 + train.fromDepMin;
        let toTime = train.toArrHour*60 + train.toArrMin;
        let d = toTime - fromTime;
        train.dur = getDateSring(Math.floor(d/60), d%60);
    }

    return train;
}

let initState = {
    selected: false,
    openStartEnd: {
        open: false,
        onFinish: () => {}
    },
    openDate: {
        open: false,
        onFinish: () => {}
    },
    pickerStartEndValueGroups: {
        start: '新竹',
        end: '台北',
    },
    pickerStartEndOptionGroups: {
        start: Object.keys(window.data.stations),
        end: Object.keys(window.data.stations),
    },
    intro: 0,
    introElement: false,
    pickerDateValueGroups: {
        days: '今天',
        hours: 12,
        mins: 30
    },
    pickerDateOptionGroups: {
        days: days,
        hours: hours,
        mins: mins
    },
    train: false,
    daysDateTable: daysDateTable,
    busiTicket: false,
    ticketPrice: 0
};

let getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

var hsr_time_keys = Object.keys(window.hsr_time);
var initTime = hsr_time_keys[getRandomInt(0, hsr_time_keys.length-1)];
var initTrains = window.hsr_time[initTime];
var initTrain = initTrains[getRandomInt(0, initTrains.length-1)]
initState.train = window.parseTrain(initTrain, false, false, initState.pickerDateValueGroups.days);

const app = (state = initState, action) => {
    switch (action.type) {
        case 'UPDATE_APP_SELECTED':
            return {
                ...state, 
                selected: action.selected
            }
        case 'OPEN_APP_START_END':
            return {
                ...state, 
                openStartEnd: {
                    open: action.open,
                    onFinish: action.onFinish
                }
            }
        case 'OPEN_APP_DATE':
            return {
                ...state, 
                openDate: {
                    open: action.open,
                    onFinish: action.onFinish
                }
            }
        case 'UPDATE_APP_PICKER_START_END_VALUE':
            return {
                ...state, 
                pickerStartEndValueGroups: action.valueGroup
            }
        case 'UPDATE_APP_PICKER_DATE_VALUE':
            return {
                ...state, 
                pickerDateValueGroups: action.valueGroup
            }
        case 'UPDATE_APP_INTRO':
            if(state.introElement){
                state.introElement.classList.remove('float');
            }
            let element = action.introElement || false;

            if(action.intro === 0){    
                element = false;
            }
            if(element){
                element.classList.add('float');
            }

            return {
                ...state, 
                intro: action.intro,
                introElement: element
            }
        case 'UPDATE_APP_ORDER_TRAIN':
            return {
                ...state, 
                train: action.train
            }
        case 'UPDATE_BUSI_TICKET':
            return {
                ...state, 
                busiTicket: action.busiTicket
            }
        case 'UPDATE_TICKET_PRICE':
            return {
                ...state, 
                ticketPrice: action.ticketPrice
            }
        // case 'TOGGLE_TODO':
        //     return state.map(todo =>
        //         (todo.id === action.id) ? {...todo, completed: !todo.completed } : todo
        //     )
        default:
            return state
    }
}

export default app