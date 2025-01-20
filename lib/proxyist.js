const superagent = require("superagent");
const cheerio = require("cheerio");

class ProxyList {
  constructor() {
    this.cached = [];
  }

  /**
   * Fetch proxies list.
   * @param {Number} page
   * @returns {Promise<object>}
   */
  fetchProxiesList(page) {
    return new Promise(function (resolve, reject) {
      superagent
        .get(
          `https://www.free-proxy-list.net`
        )
        .then(function (res) {
          let $ = cheerio.load(res.text);
          let results = [];
          let listsRaw = $("div.fpl-list table tbody > tr");
          listsRaw.each(function (index, item) {
            let children = $(item).find("td");
            let proxyItem = {};
            const countryName = $(children[3])
              .text()
              .replace(/[\t\n]/g, "");
            const is_https = $(children[8])
              .text()
              .replace(/[\t\n]/g, "");
            proxyItem.ip = $(children[0]).text();
            proxyItem.port = $(children[1]).text();
            proxyItem.country = countryName;
            proxyItem.countryCode = $(children[2]).text();
            proxyItem.protocol = is_https == "yes" ? "https" : "http";
            proxyItem.connect_time = 0;
            proxyItem.up_time = 1;
            proxyItem.last_update = $(children[9]).text();
            proxyItem.url = `${proxyItem.protocol}://${proxyItem.ip}:${proxyItem.port}`;
            if (proxyItem.country !== "China") results.push(proxyItem);
          });
          resolve(results);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  /**
   * Get all items of the list
   * @returns {Promise<object>}
   */
  get() {
    let _this = this;
    return new Promise(function (resolve, reject) {
      let responseArray = [_this.fetchProxiesList(1)];
      Promise.all(responseArray)
        .then(function (responses) {
          let results = [];
          for (let i = 0; i < responses.length; i++)
            results = results.concat(responses[i]);
          return results;
        })
        .then(function (results) {
          resolve(results);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  /**
   * Get all items of the list in a specific countryCode
   * @returns {Promise<object>}
   */
  getByCountryCode(countryCode) {
    let _this = this;
    return new Promise(function (resolve, reject) {
      _this
        .get()
        .then(function (res) {
          resolve(res.filter((proxy) => proxy.countryCode === countryCode));
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  /**
   * Get all items of the list that uses a given protocol
   * @param {String} protocol
   * @returns {Promise<object>}
   */
  getByProtocol(protocol) {
    let _this = this;
    return new Promise(function (resolve, reject) {
      _this
        .get()
        .then(function (res) {
          resolve(res.filter((proxy) => proxy.protocol === protocol));
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  /**
   * Get a random item from the list
   * @returns {Promise<object>}
   */
  random() {
    let _this = this;
    return new Promise(function (resolve, reject) {
      _this
        .get()
        .then(function (res) {
          resolve(res[Math.floor(Math.random() * res.length) + 1]);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  /**
   * Get a random item from the list in a specific country
   * @returns {Promise<object>}
   */
  randomByCountryCode(countryCode) {
    let _this = this;
    return new Promise(function (resolve, reject) {
      _this
        .getByCountryCode(countryCode)
        .then(function (res) {
          resolve(res[Math.floor(Math.random() * res.length)]);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  /**
   * Get a random proxy that us using a given protocol
   * @param {String} protocol
   * @returns
   */
  randomByProtocol(protocol) {
    let _this = this;
    return new Promise(function (resolve, reject) {
      _this
        .getByProtocol(protocol)
        .then(function (res) {
          resolve(res[Math.floor(Math.random() * res.length)]);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  /**
   * Get a random item from the list
   * @returns {Promise<object>}
   */
  randomFromCache() {
    let _this = this;
    return new Promise(function (resolve, reject) {
      if (_this.cached.length < 1) {
        _this
          .get()
          .then(function (res) {
            _this.cached = res;
            resolve(_this.cached.shift());
          })
          .catch(function (err) {
            reject(err);
          });
      } else {
        const random = Math.floor(Math.random() * _this.cached.length);
        const result = _this.cached.splice(random, 1);
        resolve(result[0]);
      }
    });
  }
}

module.exports = ProxyList;
