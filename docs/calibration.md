# Calibração da plateia

Cada versão das perguntas ao Jev avaliada no mesmo conjunto de 21 posts (`scripts/calibration/posts.ts`), cada um com o que um leitor esperaria dele: a faixa do aplauso, quem gosta e quem não gosta, e as notas. Rodada com o Jev de verdade (`npm run calibrate`) e publicada como saiu. As expectativas valem para todas as versões: quando uma muda, o relatório recalcula todas.

## As versões

- **Versão 1**: sete reações, níveis das notas sem descrição e as 12 personas no aplausômetro.
- **Versão 2**: reação “discorda”, reações descritas para não se sobrepor, cada nível das notas com o que quer dizer, e mãe, coach e tio do zap fora do aplausômetro.
- **Versão 3**: a versão 2 com comentar valendo mais que curtir e leitores descritos com o que valorizam e o que os irrita. Descartada: as frases negativas fizeram a recrutadora passar reto pela vaga e a gerente de RH revirar os olhos para a rodada de investimento, por um ponto a mais de confiança.
- **Versão 4**: a versão 2 com os pesos da 3 (comentar 0,75, curtir 0,6). É a que está no ar.

## Resumo

|                              | Versão 1 (2026-10-01) | Versão 2 (2026-10-01) | Versão 3 (2026-10-01) | Versão 4 (2026-10-01) |
| ---------------------------- | --------------------- | --------------------- | --------------------- | --------------------- |
| Expectativas atendidas       | 75 de 78              | 78 de 78              | 77 de 78              | 78 de 78              |
| Aplauso, do menor ao maior   | 5 a 77                | 1 a 81                | 1 a 82                | 1 a 85                |
| Desvio padrão do aplauso     | 22.7                  | 27.5                  | 28.4                  | 29.2                  |
| Confiança média nas personas | 51%                   | 53%                   | 54%                   | 53%                   |
| Confiança média nas notas    | 71%                   | 72%                   | 72%                   | 73%                   |
| Notas divididas              | 2                     | 1                     | 1                     | 0                     |
| Latência mediana             | 279 ms                | 287 ms                | 275 ms                | 269 ms                |

## Aplauso por post

| Post                   | Versão 1 | Versão 2 | Versão 3 | Versão 4 |
| ---------------------- | -------- | -------- | -------- | -------- |
| tecnico-com-numeros    | 70       | 75       | 75       | 79       |
| tecnico-com-cliche     | 37       | 34       | 26       | 37       |
| demissao-gratidao      | 38       | 28       | 16       | 28       |
| humblebrag             | 22       | 8        | 1        | 9        |
| texto-de-ia            | 16       | 2        | 2        | 2        |
| vaga-com-chamada       | 39       | 44       | 29       | 43       |
| vaga-sem-chamada       | 33       | 36       | 28       | 37       |
| rodada-de-investimento | 65       | 61       | 48       | 65       |
| aprendizado-de-produto | 72       | 77       | 74       | 80       |
| acessibilidade         | 77       | 78       | 82       | 83       |
| semana-de-quatro-dias  | 75       | 81       | 80       | 85       |
| primeiro-emprego       | 64       | 56       | 57       | 61       |
| certificacao           | 64       | 59       | 51       | 63       |
| caso-de-cliente        | 67       | 67       | 72       | 75       |
| curso-milagroso        | 5        | 1        | 1        | 1        |
| opiniao-arrogante      | 13       | 1        | 2        | 1        |
| bom-dia-generico       | 20       | 8        | 4        | 8        |
| licao-do-motorista     | 29       | 17       | 12       | 20       |
| desabafo-burnout       | 57       | 56       | 42       | 60       |
| texto-confuso          | 21       | 11       | 9        | 12       |
| artigo-sem-opiniao     | 40       | 43       | 30       | 41       |
