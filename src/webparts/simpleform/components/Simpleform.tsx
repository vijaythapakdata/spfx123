import * as React from 'react';
// import styles from './SimpleForm.module.scss';
// import type { ISimpleFormProps } from './ISimpleFormProps';
import { ISimpleformProps } from './ISimpleformProps';
import {Web} from "@pnp/sp/presets/all"
// import { escape } from '@microsoft/sp-lodash-subset';
import { ISimpleFormState } from './ISimpleFormState';
import {Dialog} from "@microsoft/sp-dialog";
import { PrimaryButton, Slider, TextField, Toggle } from '@fluentui/react';
import {PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
const SimpleForm:React.FC<ISimpleformProps>=(props)=>{
  const [form,setForm]=React.useState<ISimpleFormState>({
    Name:"",
    Email:"",
    FullAddress:"",
    Admin:"",
    AdminId:0,
    Age:"",
    Salary:"",
    Score:1,
    Permission:false
  })
   

  // create form
  const createItems=async()=>{
    try{
// Read site url
const web=Web(props.siteurl);
const items=await web.lists.getByTitle(props.ListName).items.add({
  Title:form.Name,
  EmailAddress:form.Email,
  Address:form.FullAddress,
  AdminId:form.AdminId,
  Score:form.Score,
  Age:parseInt(form.Age),
  Salary:parseFloat(form.Salary),
  Permission:form.Permission
});
console.log(items);
Dialog.alert(`Record with name ${form.Name} is created successfully`);
setForm({
  Name:"",
    Email:"",
    FullAddress:"",
     Admin:"",
    AdminId:0,
     Age:"",
    Salary:"",
    Score:1,
    Permission:false
});
    }
    catch(err){
console.log(err);
    }
  }
  // form event for every data type except array
  const handleChange=(fieldValue:keyof ISimpleFormState,value:string|number|boolean):void=>{
    setForm(prev=>({...prev,[fieldValue]:value}));
  }
  // get Admin
  const _getPeoplePickerItems=(items: any[])=> {
    if(items.length>0){
      setForm(prev=>({...prev,Admin:items[0].text,AdminId:items[0].id}))
    }
    else{
      setForm(prev=>({...prev,Admin:"",AdminId:0}))
    }
  console.log('Items:', items);
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
    <TextField
    label='Email Address'
    value={form.Email}
    onChange={(_,e)=>handleChange("Email",e||'')}
    />
    <Toggle
    label='Permission'
    checked={form.Permission}
    onChange={(_,checked)=>handleChange("Permission",checked||'')}
    />
    {/* People picker */}
<PeoplePicker
    context={props.context as any}
    titleText="Admin"
    personSelectionLimit={1}
    showtooltip={true}
    onChange={_getPeoplePickerItems}
    principalTypes={[PrincipalType.User]}
    resolveDelay={1000} 
    ensureUser={true}
    defaultSelectedUsers={[form.Admin?form.Admin:'']}
    webAbsoluteUrl={props.siteurl}
    />
     <TextField
    label='Age'
    value={form.Age}
    onChange={(_,e)=>handleChange("Age",e||'')}
    />
     <TextField
    label='Salary'
    value={form.Salary}
    onChange={(_,e)=>handleChange("Salary",e||'')}
    prefix='$'
    suffix='USD'
    />
    <Slider
    label='Score'
    value={form.Score}
    onChange={(v)=>handleChange("Score",v||0)}
    />
    <TextField
    label='Full Address'
    value={form.FullAddress}
    onChange={(_,e)=>handleChange("FullAddress",e||'')}
    multiline
    rows={5}
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
