export class Object {
    name: string;
    id: number;
    shape: string;
    content: string;
    height: string;
    width: string;
    top: string;
    left: string;
    right: string;
    bottom: string;
    imgPath: string;
    constructor(name: string, id: number, shape: string, content: string, height: string, width: string, 
        top: string, left: string, right: string, bottom: string, imgPath: string){
            this.name = name;
            this.id = id;
            this.shape = shape;
            this.content = content;
            this.height = height;
            this.width = width;
            this.top = top;
            this.left = left;
            this.right = right;
            this.bottom = bottom;
            this.imgPath = imgPath;
    }
}