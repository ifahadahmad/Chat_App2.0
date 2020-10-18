import React,{useState} from 'react';

export default initialVal=>{
    const [data,setData] = useState(initialVal);
    const handleChange = e=>{
        setData({...data,[e.target.name]:e.target.value});
    };
    const reset = e=>{
        setData(initialVal);
    }
    return [data,handleChange,reset];
}