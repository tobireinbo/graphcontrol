# Graphcontrol

Graphcontrol is a OGM for Neo4j. It is intended for use in TypeScript, so you don't have to know any Cypher in order to query a Neo4j Database. This library isn't really suited for more complex Cypher Queries.


## Installation
It can be installed via npm.

    npm i graphcontrol
 
 ## API
 Setting up a Schema
 

    const provider = new Neo4jProvider({
		url: "bolt://localhost:7687",
		username: "neo4j",
		password: "password"
	});
	
	type PersonProps = {
		name: string;
		age: number;
	}
	
	const Person = new Schema<PersonProps>(provider, "Person");
Relations can be defined the following way:

	const relations = [{
		id: "car", //id to reference by
		schema: "Car", //label of the targeted Schema
		label: "OWNS", //relation label, e.g. ()-[:OWNS]->()
		direction: "to" //relation direction
	}];
    const PersonWithRelations = new Schema<PersonProps>(provider, "Person", relations);

getting nodes of a Schema

    //all Nodes
    await Person.getNodes();
    
    //Person by Name
    await Person.getNodes({where: {name: "John"}});
    
    //find People named John and optionally their blue car(s)
    await Person.getNodes({
	    where: {name: "John"},
	    relations: [{
		    id: "car",
		    where: {color: "blue"}
	    }]
    });
   
   
WIP

