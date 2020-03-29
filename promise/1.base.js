let Promise = require('./promise');
new Promise((resolve,reject)=>{
  setTimeout(()=>{
    resolve(11)
  },1000)
}).then(value=>{
  console.log(value)
},reason=>{
  console.log('fail'+reason)
})