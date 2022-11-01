import React, {Component} from 'react'
import axios from 'axios'
import {Table, Button, Container} from 'reactstrap'
import {Link} from 'react-router'

function formatEur(price) {
  return `${(price / 100).toFixed(2)} €`
}

class Bills extends Component {
  state = {
    bills: [],
  }

  async componentWillMount() {
    const {data} = await axios.get('/api/pros/me/bills')
    console.log(data)
    this.setState({bills: data})
  }

  render() {
    return (
      <Container>
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombres d'offres</th>
              <th>Prix</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.state.bills.map(bill => (
              <tr>
                <th>{bill.id}</th>
                <th>{bill.nbOffers}</th>
                <th>{formatEur(bill.price)}</th>
                <th>
                  <Link to={`/billDetail/${bill.id}`}>
                    <Button>Voir détail</Button>
                  </Link>
                </th>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    )
  }
}

export default Bills
