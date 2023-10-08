const fs = require('fs');
const $rdf = require('rdflib');

const store = $rdf.graph();
const ns = {
  rdf: $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
  owl: $rdf.Namespace('http://www.w3.org/2002/07/owl#'),
  rdfs: $rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#'),
  onto: $rdf.Namespace('http://www.semanticweb.org/jo_az/ontologies/2023/9/untitled-ontology-29#')
};

// Lendo a ontologia fornecida em RDF
const rdfContent = fs.readFileSync('C:/Users/jo_az/OneDrive/Documentos/Ontologias/ontologia.rdf', 'utf-8');

// Parse do RDF
$rdf.parse(rdfContent, store, 'http://www.semanticweb.org/jo_az/ontologies/2023/9/untitled-ontology-29', 'application/rdf+xml');

// Restante do código permanece igual...


// Parse do RDF
$rdf.parse(rdfContent, store, 'http://www.semanticweb.org/jo_az/ontologies/2023/9/untitled-ontology-29', 'application/rdf+xml');

// Adicionando indivíduo
const alunoUri = ns.onto('1401243'); // Substitua com o URI do aluno
const aluno = $rdf.sym(alunoUri);
store.add(aluno, ns.rdf('type'), ns.onto('PerfilAluno'));

// Adicionando DataProperties
const anoIngresso = $rdf.literal(2021, undefined, ns.owl('int'));
const cotista = $rdf.literal(false, undefined, ns.owl('boolean'));
const naturalJF = $rdf.literal(true, undefined, ns.owl('boolean'));
const recebeuAEB = $rdf.literal(false, undefined, ns.owl('boolean'));

store.add(aluno, ns.onto('AnoIngresso'), anoIngresso);
store.add(aluno, ns.onto('Cotista'), cotista);
store.add(aluno, ns.onto('NaturalJF'), naturalJF);
store.add(aluno, ns.onto('RecebeuAEB'), recebeuAEB);

const rdfXml = new $rdf.Serializer(store).statementsToXML(store.match());

// Salvar o RDF em um arquivo
fs.writeFile('ontologia_modificada.rdf', rdfXml, (err) => {
  if (err) throw err;
  console.log('As modificações foram salvas com sucesso!');
});