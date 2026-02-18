import mongoose from 'mongoose'


const Connection = ()=>{

   mongoose.connect(process.env.mongoConnectionString).then(()=>{
    console.log("Connection established succesfully in mangodb atlas");
    

   }).catch((err)=>{
    console.log("Connection failed unfortunetly", err)

   })

}


export default Connection; 