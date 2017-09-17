import htmlToJson from 'html-to-json';

const _findArticlePromise = (regexp, options) => {    
    regexp = regexp || new RegExp();
    const pageFrom = options.pageFrom || "";
    let inDays = [];
    if(options.inDays){
        let now = new Date();
        inDays.push(now);
        for(let i = 1 ; i <= options.inDays ; i++){
            let d = new Date();
            d.setDate(now.getDate() - i);
            inDays.push(d);
        }
        inDays = inDays.map(d => (d.getMonth()+1) + '/' + d.getDate());
        // console.log(inDays);
    }

    // console.log('pageFrom', pageFrom, regexp);

    let promise = fetch(`https://www.ptt.cc/bbs/Stock/index${pageFrom}.html`)
    .then( function(response) {
        return response.text();
    })
    .then( function(html) {
        // console.log(html)
        return htmlToJson.parse(html, {
            'articles': function ($doc) {
                // ex. link would be <a href="/bbs/PublicServan/M.1127742013.A.240.html">Re: [問題] 職等</a>
                return this.map('.r-ent', function($item, index){
                    const $titleA = $item.find('.title a');
                    const href = $titleA.attr('href');
                    return {
                        title: $titleA.text(),
                        id: href ? href.split('/')[3].replace('.html', '') : false,
                        href: href,
                        date: $item.find('.meta .date').text().trim()
                    };
                })
            }     
        });
    })
    .then( function(data) {
        // console.log(data);
        return data.articles.filter((article, index) => {
            let result = true;
            if(!article.id || !article.title.match(regexp)){
                result = false;
            }
            if(result && inDays.length > 0){
                // console.log(article);
                if(inDays.indexOf(article.date) === -1){
                    result = false;
                }
            }
            return result;
        });
    })
    .then(results => {
        // console.log('results', results);
        if(results.length > 0 || pageFrom === 3665 || pageFrom === ""){
            return results;
        }else{
            return _findArticlePromise(regexp, {
                pageFrom: pageFrom-1,
                inDays: options.inDays
            });
        }
    })
    .catch( function(error) {
        console.log(error);
    });

    return promise;
};

const _findLastPagePromise = () => {
    const promise = fetch(`https://www.ptt.cc/bbs/Stock/index.html`)
    .then( function(response) {
        return response.text();
    })
    .then( function(html) {
        // console.log(html)
        return htmlToJson.parse(html, {
            'buttons': function ($doc) {
                return this.map('.btn-group-paging .btn', function($item, index){
                    return {
                        text: $item.text(),
                        href: $item.attr('href')
                    };
                })
            }          
        });
    })
    .then( function(data) {
        // console.log(data);

        let nowPage = false;
        data.buttons.forEach(btn => {
            if(nowPage){
                return;
            }
            if(btn.text.indexOf("上頁") !== -1){
                const match = btn.href.match(/\/bbs\/Stock\/index(\d*)\.html/);
                if(match){
                    nowPage = match[1]*1 + 1;
                }
            }
        }); 

        return nowPage;
    })
    .catch( function(error) {
        console.log(error);
    });

    return promise;
};

let initState = {
    lastPage: false,
    _findArticlePromise: _findArticlePromise,
    _findLastPagePromise: _findLastPagePromise
};

const app = (state = initState, action) => {
    switch (action.type) {
        case 'UPDATE_APP_LAST_PAGE':
            return {
                ...state, 
                lastPage: action.page
            }
        default:
            return state
    }
}

export default app