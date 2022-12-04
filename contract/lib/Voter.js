
'use strict';

class Voter {

    constructor(voterId, name){
        if(this.validateVoterId(voterId)){

            this.voterId = voterId;
            this.name = name;
            this.hasVoted = false;
            this.type = 'voter';
            if(this.__isContract){
                delete this.__isContract;
            }
            if(this.name){
                delete this.name;
            }
            return this;

        } else {
            throw new Error('The voterId is not valid');
        }
    }


    async validateVoterId(voterId){
        if(voterId){
            return true;
        } else{
            return false;
        }
    }

}
module.exports =  Voter;