const fs = require('fs');
const $rdf = require('rdflib');
const csv = require('csv-parser');
const iconv = require('iconv-lite');
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




const resultados = [];

fs.createReadStream('evadidos.csv')
  .pipe(csv({ separator: ';' })) // Indicando que o separador é ponto e vírgula
  .on('data', (row) => {
    resultados.push({
      idpessoa: row.IDPESSOA,
      anoingresso: parseInt(row.INGRESSO),
      naturaljf: row.NATURALJF==1?true:false,
      cotista: row.COTISTA==1?true:false,
      recebeubolsa_ae: row.RECEBEUBOLSA_AE==1?true:false
    });
  })
  .on('end', () => {
    console.log('Leitura do arquivo CSV concluída.');
    console.log('Resultados:', resultados);

    for (var aluno of resultados) {
      const instanciasPerfilAluno = store.each(undefined, ns.rdf('type'), ns.onto('PerfilAluno'));
      let instanciaEncontrada = false;

      for (const instancia of instanciasPerfilAluno) {
        const valor = instancia.value.split('#');

        if (valor[1] === aluno['idpessoa'].toString()) {
          instanciaEncontrada = true;
          break;
        }
      }

      if (instanciaEncontrada) {
        console.log(`Ja existe uma instancia de PerfilAluno com o rotulo ${aluno['idpessoa'].toString()}`);
      } else {
        console.log(`Adicionando a instancia PerfilAluno de rotulo ${aluno['idpessoa'].toString()}`);
        const alunoUri = ns.onto(aluno['idpessoa'].toString()); // Substitua com o URI do aluno
        const alunoResource = $rdf.sym(alunoUri);
        store.add(alunoResource, ns.rdf('type'), ns.onto('PerfilAluno'));

        const anoIngresso = $rdf.literal(aluno.anoingresso, undefined, ns.owl('int'));
        const cotista = $rdf.literal(aluno.cotista, undefined, ns.owl('boolean'));
        const naturalJF = $rdf.literal(aluno.naturaljf, undefined, ns.owl('boolean'));
        const recebeuAEB = $rdf.literal(aluno.recebeubolsa_ae, undefined, ns.owl('boolean'));

        store.add(alunoResource, ns.onto('AnoIngresso'), anoIngresso);
        store.add(alunoResource, ns.onto('Cotista'), cotista);
        store.add(alunoResource, ns.onto('NaturalJF'), naturalJF);
        store.add(alunoResource, ns.onto('RecebeuAEB'), recebeuAEB);
      }
    }


    var historicoNotas = []
    fs.createReadStream('historicoevadidos.csv')
    .pipe(csv({ separator: ';' })) // Indicando que o separador é ponto e vírgula
    .on('data', (row) => {
      historicoNotas.push({
        idpessoa: row.IDPESSOA,
        disciplina: row.DISCIPLINA.toString(),
        nota: row.NOTA,
        ano: row.ANO,
        semestre: row.SEMESTRE
      });
    })
    .on('end', () => {
      const instanciasDisciplinas = store.each(undefined, ns.rdf('type'), ns.onto('Disciplina'));
      const intanciaEncontrada = false;
    for(NovaDisciplina of historicoNotas){
      instanciaEncontrada = false;
         for(instancia of instanciasDisciplinas){
          const valor = instancia.value.split('#');
          if (valor[1] === NovaDisciplina['disciplina'].toString()) {
            instanciaEncontrada = true;
            break;
          }
         }
         if(!instanciaEncontrada){
          const disciplinaUri = ns.onto(NovaDisciplina['disciplina'].replaceAll(' ', '_')); // Substitua com o URI do aluno
          const disciplinaResource = $rdf.sym(disciplinaUri);
          store.add(disciplinaResource, ns.rdf('type'), ns.onto('Disciplina'));
          console.log(`Disciplina ${NovaDisciplina['disciplina'].replaceAll(' ', '_')} adicionada`)
         }

    }
    
    for(nota of historicoNotas){
      const notaUri = ns.onto(`Nota_${nota['idpessoa']}_${nota['disciplina'].replaceAll(' ', '_')}_${nota['ano']}_${nota['semestre']}`);
      const notaResource = $rdf.sym(notaUri);

      const notaLiteral = $rdf.literal(nota['nota'], undefined, ns.owl('string'));
      const anoLiteral = $rdf.literal(parseInt(nota['ano']), undefined, ns.owl('int'));
      const semestreLiteral = $rdf.literal(parseInt(nota['semestre']), undefined, ns.owl('int'));
      

      store.add(notaResource, ns.rdf('type'), ns.onto('Nota'));
      store.add(notaResource, ns.onto('valorNota'), notaLiteral);
      store.add(notaResource, ns.onto('AnoCursada'), anoLiteral);
      store.add(notaResource, ns.onto('SemestreCursada'), semestreLiteral);

      
      const disciplinas = store.each(undefined, ns.rdf('type'), ns.onto('Disciplina'));
      let disciplinaResource = null;
        for (const disciplina of disciplinas) {
          const r = disciplina.uri.split('#')[1]; // Obtém o rótulo da disciplina
          if (r === nota['disciplina'].replaceAll(' ', '_').toString()) {
            disciplinaResource = disciplina;
            break; // Sai do loop quando a disciplina é encontrada
          }
        }
      
      

      const perfisAlunos = store.each(undefined, ns.rdf('type'), ns.onto('PerfilAluno'));
      let perfilAlunoResource = null;

      for (const perfil of perfisAlunos) {
        const r = perfil.uri.split('#')[1]; // Obtém o rótulo do aluno
        if (r === nota['idpessoa'].toString()) {
          perfilAlunoResource = perfil;
          break; // Sai do loop quando o perfil do aluno é encontrado
        }
      }

      store.add(notaResource, ns.onto('pertenceADisciplina'), disciplinaResource);
      store.add(perfilAlunoResource, ns.onto('obteveNota'), notaResource);

  
    }

    const rdfXml = new $rdf.Serializer(store).statementsToXML(store.match());

    // Salvar o RDF em um arquivo
    fs.writeFile('ontologia_modificada.rdf', rdfXml, (err) => {
      if (err) throw err;
      console.log('As modificações foram salvas com sucesso!');
    });
    })




  });
