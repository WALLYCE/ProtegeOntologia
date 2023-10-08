const $rdf = require('rdflib');
const fs = require('fs');

const store = $rdf.graph();

const localFilePath = 'C:/ontologia.rdf';

fs.readFile(localFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Erro ao ler o arquivo:', err);
    return;
  }
  
  // Parse do conteúdo RDF
  $rdf.parse(data, store, 'file:///C:/ontologia.rdf', 'application/rdf+xml');
  
  // Adicionar instâncias
  const ns = {
    ex: $rdf.Namespace('http://exemplo.com/ontologia#'), // Substitua pelo seu namespace
  };
  
  
  const sujeito = $rdf.sym('http://exemplo.com/ontologia#instancia1'); // Substitua pela URI da instância
  const predicado = ns.ex['propriedade']; // Substitua 'propriedade' pelo nome da propriedade
  const objeto = $rdf.lit('Valor da Propriedade'); // Substitua pelo valor da propriedade
  
  store.add(sujeito, predicado, objeto);
  
  // Serializar o grafo de volta para RDF/XML
  const rdfData = $rdf.serialize(undefined, store, 'file:///C:/ontologia_refeita.rdf', 'application/rdf+xml');
  
  // Escrever o RDF de volta no arquivo
  fs.writeFile(localFilePath, rdfData, (err) => {
    if (err) {
      console.error('Erro ao salvar o arquivo:', err);
      return;
    }
    console.log('Ontologia salva com sucesso');
  });
});
