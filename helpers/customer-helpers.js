var db=require('../config/connection')
module.exports={
    addcustomer:(customer,callback)=>{
        console.log(customer);
        db.get().collection('product').insertOne(customer).then((data)=>{
            callback(true)

        })
    }, 
    showcustomer:()=>{
      return new Promise(async(resolve,reject)=>{  
        let customer= await db.get().collection('product').find().toArray()
         resolve(customer)   
      })
    },
    deletecustomer:()=>{
        return new Promise(async(resolve,reject)=>{  
          let customer= await db.get().collection('product').drop()
           resolve(customer)   
        })
  }
}