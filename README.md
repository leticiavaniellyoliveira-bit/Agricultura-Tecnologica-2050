# Agricultura Tecnológica 2050

Projeto desenvolvido para apresentar uma plataforma de apoio ao produtor rural, com mapa interativo, dados climáticos por coordenadas, simulação de umidade do solo, recomendações de plantio e calculadora de BioSubstrato.

## Funcionalidades

- Consulta de clima em tempo real usando latitude e longitude.
- Mapa interativo com marcador da localização informada.
- Atualização de temperatura, vento, umidade do solo e alertas agrícolas.
- Recomendações de plantio com base no clima e na umidade simulada.
- Calculadora de BioSubstrato por área e profundidade.
- Indicadores de sustentabilidade, como uso de água, eficiência hídrica e pegada de carbono.
- Layout responsivo para computador e celular.

## Como usar

1. Abra o arquivo `index.html` no navegador.
2. Digite uma coordenada no campo de localização, por exemplo:

```text
-15.7939, -47.8828
```

3. Clique em `Atualizar clima e recomendações`.
4. O mapa será movido para a região informada e os dados climáticos serão atualizados.

## Tecnologias utilizadas

- HTML
- CSS
- JavaScript
- Leaflet
- OpenStreetMap
- Open-Meteo
- Chart.js

## Estrutura do projeto

```text
Agricultura-Tecnologica-2050-main/
|-- index.html
|-- styles.css
|-- script.js
`-- README.md
```

## Observação

O projeto precisa de conexão com a internet para carregar o mapa, os gráficos externos e os dados climáticos.
