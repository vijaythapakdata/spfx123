import * as React from 'react';
// import styles from './SimpleForm.module.scss';
// import type { ISimpleFormProps } from './ISimpleFormProps';
import { ISimpleformProps } from './ISimpleformProps';
import {Web} from "@pnp/sp/presets/all"
// import { escape } from '@microsoft/sp-lodash-subset';
import { ISimpleFormState } from './ISimpleFormState';
import {Dialog} from "@microsoft/sp-dialog";
import { PrimaryButton, TextField } from '@fluentui/react';
const SimpleForm:React.FC<ISimpleformProps>=(props)=>{
  const [form,setForm]=React.useState<ISimpleFormState>({
    Name:""
  })
   

  // create form
  const createItems=async()=>{
    try{
// Read site url
const web=Web(props.siteurl);
const items=await web.lists.getByTitle(props.ListName).items.add({
  Title:form.Name
});
Dialog.alert(`item with Id ${items.data} is created sucsessfully`);
setForm({
  Name:""
});
    }
    catch(err){
console.log(err);
    }
  }
  // form event for every data type except array
  const handleChange=(fieldValue:keyof ISimpleFormState,value:string):void=>{
    setForm(prev=>({...prev,[fieldValue]:value}));
  }
  return(
    <>


    {/* <TextField
    label='Name'
    value={form.Name}
    onChange={(_,e)=>setForm(prev=>({
      ...prev,Name:e||''
    }))}
    /> */}
    {/* a=[1,2,3,4],b=[5,6,7,8], c=[...a[2,3],b] ,c=[3,4,5,6,7,8]*/}
    <TextField
    label='Name'
    value={form.Name}
    onChange={(_,e)=>handleChange("Name",e||'')}
    />
    <br/>
    <PrimaryButton
    text='Save'
    onClick={createItems}
    iconProps={{iconName:'save'}}
    />
    </>
  )
}
export default SimpleForm;
