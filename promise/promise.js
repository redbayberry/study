const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';
const resolvePromise = (promise2, x, resolve, reject) => {
  //判断可能你的promise要和别人的promise来混用
  if (promise2 === x) {
    return reject(new TypeError('chaining cycle detected for promise #<promise>'))
  }
  //判断x的状态，判断x是不是promise
  if (typeof x === 'object' && x !== null || typeof x === 'function') {
    let called;//为了考虑别人的promise多次调用成功，失败，调用成功后就不能失败
    try {
      let then = x.then;//去除then，但是有可能会抛出异常，这个then方法是采用defineProperty
      if (typeof then === 'function') {
        //判断then是不是一个函数，如果then不是一个函数，说明不是一个promise
        //只能认准他是一个promisex.then(()=)
        //x.then(()={},()=>{}),不这样写是因为x.then可能还是报错
        //如果是个promise，那么怎么拿到它的值呢，可以调用它的then方法
        then.call(x, (y) => {
          if (called) return;
          called = true;
          // resolve(y),如果y还是promise呢
          console.log(y, 'uuuuuuu')
          resolvePromise(promise2, y, resolve, reject)
        }, (e) => {
          if (called) return;
          called = true;
          reject(e)
        })
      } else {
        //x = { then: 123 }
        resolve(x)
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e)//取then失败了，直接触发promise2的失败逻辑
    }
  } else {
    resolve(x)
  }
}
class Promise {
  constructor(executor) {
    this.status = PENDING;
    this.reason = undefined;
    this.value = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];
    let resolve = (value) => {
      if (this.status == PENDING) {
        this.status = FULFILLED;
        this.value = value;
        this.onResolvedCallbacks.forEach(fn => fn())
      }
    }
    let reject = (reason) => {
      if (this.status == PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }
  then(onFulfilled, onRejected) {
    //如果onFulfilled不传，就将参数往后传
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : val => val;
    onRejected = typeof onRejected === 'function': onRejected: err => {
      throw err
    }
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {//这里用异步是因为同步的话拿不到promise2
          try {//这里加try catch是因为它只捕获同步异常
            let x = onFulfilled(this.value);//这里x可能是普通值，也可能是promise
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)

      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      }
      if (this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }

    })

    return promise2
  }
}
module.exports = Promise;