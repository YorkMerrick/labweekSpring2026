import './config'
import { fetchPrs } from './api/github'

function main() {
  fetchPrs().then((prs) => console.log(prs))
}

main()
