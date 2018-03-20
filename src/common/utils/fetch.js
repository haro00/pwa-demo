const isObj = obj => Object.prototype.toString.call(obj) === '[object Object]';

/**
 * 封装fetch
 * 上传文件的body属性使用FormData格式
 * @param url
 * @param opt {method, headers, body, ...rest}
 * @returns {Promise<any>}
 */
export default function fetch(url, opt) {
    return new Promise((resolve, reject) => {
        if (!isObj(opt)) {
            opt = {};
        }
        let base = process.env.NODE_ENV === 'production' ? '' : '';
        // 可以传入请求必需的头字段
        let headers = new Headers({});
        if (isObj(opt.headers)) {
            for (let k in opt.headers) {
                headers.set(k, opt.headers[k]);
            }
        }
        Reflect.deleteProperty(opt, 'headers');
        if (opt.method && opt.method !== 'GET') {
            if (isObj(opt.body)) {
                headers.set('Content-Type', 'application/json;charset=UTF-8');
                opt.body = JSON.stringify(opt.body);
            }
        } else {
            if (isObj(opt.body)) {
                let arr = [];
                for (let k in opt.body) {
                    arr.push(`${k}=${opt.body[k]}`);
                }
                if (arr.length > 0) {
                    url += `?${arr.join('&')}`;
                }
            }
            Reflect.deleteProperty(opt, 'body');
        }
        let req = new Request(base + url, {
            method: 'GET',
            headers,
            ...opt
        });
        
        fetch(req).then(res => {
            if (res.ok) {
                resolve(res.json());
                return false;
            }
            // 此处status为请求的Response状态, 而不是返回字段中的status属性
            if (res.status === 401) {
                // 对应的提示信息方法
                // alert('登录超时, 请重新登录');
                let timer = setTimeout(() => {
                    clearTimeout(timer);
                    location.href = '/login';
                }, 1500);
            }
        }).catch(err => {
            reject(err);
        });
    });
}