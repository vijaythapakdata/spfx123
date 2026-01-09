import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'SimpleformWebPartStrings';
import Simpleform from './components/Simpleform';
import { ISimpleformProps } from './components/ISimpleformProps';

export interface ISimpleformWebPartProps {
  description: string;
  ListName:string;
}

export default class SimpleformWebPart extends BaseClientSideWebPart<ISimpleformWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public async render(): Promise<void> {
    const element: React.ReactElement<ISimpleformProps> = React.createElement(
      Simpleform,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
         context:this.context,
        ListName:this.properties.ListName,
        siteurl:this.context.pageContext.web.absoluteUrl,
        departmentOptions:await this.getChoiceValues(this.properties.ListName,this.context.pageContext.web.absoluteUrl,"Department"),
        genderOptions:await this.getChoiceValues(this.properties.ListName,this.context.pageContext.web.absoluteUrl,"Gender"),
        skillsOptions:await this.getChoiceValues(this.properties.ListName,this.context.pageContext.web.absoluteUrl,"Skills")
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
  //Read choice values

  private async getChoiceValues(ListName:string,siteurl:string,fieldValue:any):Promise<string>{
try{
const response=await fetch(`${siteurl}/_api/web/lists/getbytitle('${ListName}')/fields?$filter=EntityPropertyName eq '${fieldValue}'`,
 {
  method:'GET',
  headers:{
    'Accept':'application/json;odata=nometadata'
  }
 }
);
if(!response.ok){
  throw new Error(`Error while getting choice values ${response.text}-${response.status}`);
};
const data=await response.json();
const choices=data.value[0].Choices

return choices.map((item:any)=>({
  key:item,
  text:item
}));
}
catch(err){
console.log('Error while getting choice',err);
throw err;
}
  }
}
