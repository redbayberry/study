let fs =require('fs');
let Promise = require('./promise')
function read(...args){
  return new Promise((resolve,reject)=>{
    fs.readFile(...args,function(err,data){
      if(err){
        reject(err)
      }
      resolve(data)
    })
  })
}
let promise2 =read('name.txt','utf8').then(data=>{
  return new Promise((resolve,reject)=>{
    resolve('hhh')
  })
})
//如何将then里面的只传到下一个then里面，因为then之后返回一个promise2，再then里面
//会调用promise2的resolve
//而且部管理then里面成功还是失败的回调，返回的值都会再下一个then的成功回调里执行，除非抛错
promise2.then(data=>{
  console.log(data)
})