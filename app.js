const rp = require('request-promise')
const logger = require('signale')
const cheerio = require('cheerio')
const rString = require("randomstring");
logger.config({
    displayFilename: false,
    displayTimestamp: true,
    displayDate: false
}); 

let fName = "Jane"
let lName = 'Doe'
let locationID = '12345'
let zip = '12345'
let catchall = "mycatchalldomain.com"




getCSRF = async () => {

    let options = {
        url: 'https://iframe.punchh.com/whitelabel/deltaco/ecrm?source=',
        method: 'GET',
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    return rp(options)
}

async function submitForm(csrf,day,month,year){
    let headers = {
        'authority': 'iframe.punchh.com',
        'pragma': 'no-cache',
        'cache-control': 'no-cache',
        'origin': 'https://iframe.punchh.com',
        'upgrade-insecure-requests': '1',
        'dnt': '1',
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'referer': 'https://iframe.punchh.com/whitelabel/deltaco/ecrm',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7,zh-CN;q=0.6',
    };

    let options = {
        url: 'https://iframe.punchh.com/whitelabel/deltaco/ecrm',
        simple: false,
        method: 'POST',
        headers: headers,
        resolveWithFullResponse:true,
        formData: {
            utf8: '%E2%9C%93',
            authenticity_token:csrf,
            source: '',
            'user[email]':`${rString.generate(7)}@${catchall}`,
            'user[first_name]':fName,
            'user[last_name]':lName,
            'user[birthday(3i)]':day,
            'user[birthday(2i)]':month,
            'user[birthday(1i)]':year,
            'user[city]':'Fremont',
            'user[zip_code]':zip,
            location_id: locationID,
            'user[profile_field_answers][joininnercircle]':'No',            
            commit: 'Submit' 
        }
    };
    return new Promise((resolve, reject) => {
        rp(options).then((res) => {
            if(res.statusCode <= 302){
                resolve()
            }else{
                reject(res.statusCode)
            }
        }).catch((err) =>{
            reject(err)
        })
    })
}

async function doTask(day,month){
    logger.start(`[Birthday ${month}/${day}/2000] Starting`)
    let r = await getCSRF()    
    let csrf = r("input[name=authenticity_token]").val()
    logger.info(`[Birthday ${month}/${day}/2000] Obtained CSRF Token: ${csrf}`);
    try{
        let r = await submitForm(csrf,day,month,2000)
        logger.success(`[Birthday ${month}/${day}/2000] Submitted sign-up.`)
    }catch(err){
        logger.error(err)
    }
}

async function main(){
    for(let day = 1; day <= 31; day ++){
        for(let month = 1; month <= 12; month ++){
            doTask(day,month)
        }
    }
}
main()
