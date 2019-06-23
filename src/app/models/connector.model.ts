export class Connectors {
    name: string="Arrow";
    id: number;
    connectorType:boolean=false;
    content: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    constructor(data){
            this.id = data.id;
            this.content="";
            this.x1=data.x1;
            this.connectorType=data.connectorType;
            this.y1=data.y1;
            this.x2=data.x2;
            this.y2=data.y2;
    }
}