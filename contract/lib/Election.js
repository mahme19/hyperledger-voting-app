
'use strict';

class Election {

    constructor(name, year){

        this.electionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        if(this.validateElection(this.electionId)){
            this.name = name;
            this.year = year;
            this.type = 'election';
            if(this.__isContract){
                delete this.__isContract;
            }
            return this;
        }
        else {
            throw new Error('Election not valid')
        }
        
    }
    
    async validateElection(electionId){
        if(electionId){
            return true;
        } else {
            return false;
        }
    }
} 
module.exports =  Election;  