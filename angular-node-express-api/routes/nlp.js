const { NlpManager } = require('node-nlp');
var express = require('express');
var router = express.Router();

/* GET users listing. */

 
const manager = new NlpManager({ languages: ['en'] });

manager.addDocument('en', 'can we have next one', 'action.next');
manager.addDocument('en', 'please change the picture', 'action.next');
manager.addDocument('en', 'I don\'t like this pic' , 'action.next');
manager.addDocument('en', 'change the image', 'action.next');
manager.addDocument('en', 'move to next', 'action.next');
manager.addDocument('en', 'show another one', 'action.next');
manager.addDocument('en', 'Draw something else', 'action.random');
manager.addDocument('en', 'Draw a random picture', 'action.random');
manager.addDocument('en', 'something random', 'action.random');
manager.addDocument('en', 'Draw a tiger', 'action.draw');
manager.addDocument('en', 'can we have a drawing of tiger', 'action.draw');
manager.addDocument('en', 'can you draw a tiger for us', 'action.draw');
manager.addDocument('en', 'draw picture', 'action.draw');
manager.addDocument('en', 'draw a picture', 'action.draw');
manager.addDocument('en', 'dcan you get a image of tiger for us', 'action.draw');
 
// Train also the NLG
manager.addAnswer('en', 'action.draw', 'Draw');
manager.addAnswer('en', 'action.next', 'Next');
manager.addAnswer('en', 'action.random', 'Random');

 
// Train and save the model
// (async() => {
//     await manager.train();
//     manager.save();
//     const response = await manager.process('en', 'i don\'t like this one');
//     console.log(response);
// })();
router.post('/', async(req, res, next) =>{
        await manager.train();
        manager.save();
        const response = await manager.process('en', req.body.statement);
        console.log(JSON.stringify(response,null,2));
        res.json({res:response});
  });

  module.exports = router;