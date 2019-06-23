const { NlpManager } = require('node-nlp');
var express = require('express');
var router = express.Router();

/* GET users listing. */

 
const manager = new NlpManager({ languages: ['en'] });

manager.addDocument('en', 'can we have a rectangle from top 10 units and left seven units one', 'action.draw');
manager.addDocument('en', 'Draw a oval  10 units from right and 5 units from bottom', 'action.draw');
manager.addDocument('en', 'Draw a oval  10 units from left and five units from top', 'action.draw');
manager.addDocument('en', 'Draw a oval  10 units from left and 5 units from bottom', 'action.draw');
manager.addDocument('en', 'Draw a oval  10 units from top', 'action.draw');
manager.addDocument('en', 'Draw a rectangle  10 units from bottom', 'action.draw');
manager.addDocument('en', 'Draw a square  10 units from right', 'action.draw');
manager.addDocument('en', 'Draw a oval 10 units from left', 'action.draw');
manager.addDocument('en', 'Draw a oval 10 units below the last object', 'action.relative');
manager.addDocument('en', 'Draw a rectangle 10 units below the first object', 'action.relative');
manager.addDocument('en', 'Draw a oval ten units under the previous object', 'action.relative');
manager.addDocument('en', 'Draw a circle 10 units below the last object', 'action.relative');
manager.addDocument('en', 'Draw a oval seven units on top of the third object', 'action.relative');
manager.addDocument('en', 'Draw a oval 10 units above the previous object', 'action.relative');
manager.addDocument('en', 'Draw a rectangle five units below the last object', 'action.relative');
manager.addDocument('en', 'Draw a oval 10 units on the right of the last object', 'action.relative');
manager.addDocument('en', 'Draw a oval 10 units on the left of the previous object', 'action.relative');
manager.addDocument('en', 'Draw a oval ten units on the right of the last object', 'action.relative');
manager.addDocument('en', 'Draw a oval  10 units on the right of the third object', 'action.relative');
manager.addDocument('en', 'Draw a oval  10 units on the left of the second object', 'action.relative');


// Train also the NLG
manager.addAnswer('en', 'action.draw', 'Draw');
manager.addAnswer('en', 'action.relative', 'Relative');

router.post('/', async(req, res, next) =>{
        await manager.train();
        manager.save();
        const response = await manager.process('en', req.body.statement);
        console.log(JSON.stringify(response,null,2));
        res.json({res:response});
  });

router.post('/getEntities', async(req, res, next) =>{
      const response = await manager.process('en', req.body.statement);
      console.log(JSON.stringify(response,null,2));
      res.json({res:response});
});

  module.exports = router;