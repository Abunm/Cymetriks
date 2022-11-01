import React, {Component} from "react"
import {Container, Table, Button} from "reactstrap"
import axios from "axios"
import moment from "moment"

function formatEur(price) {
  return `${(price / 100).toFixed(3)} €`
}

class BillDetail extends Component {
  state = {
    bill: undefined,
  }

  async componentWillMount() {
    const {id} = this.props.params
    const {data} = await axios.get(`/api/pros/me/bills/${id}`)
    console.log(data)
    this.setState({bill: data})
  }

  render() {
    const {bill} = this.state
    if (!bill) {
      return null
    }
    const withoutTax = bill.price * (1 - bill.tax)
    const unityPrice = withoutTax / bill.nbOffers
    return (
      <Container>
        <div>
          <h1>WinWin</h1>
          <h2>
            Facture Winwin n°{bill.id}
          </h2>
          <Button
            color="link"
            style={{float: "right"}}
            onClick={() => window.print()}
          >
            Imprimer la facture
          </Button>
          <h4>
            Le {moment(bill.created_at).lang("fr").format("LL")}
          </h4>
          <p>
            {bill.pro.companyName}
            <br />
            {bill.pro.address}
            <br />
            {bill.pro.zipcode} {bill.pro.city}
          </p>
          <Table style={{marginTop: 20}}>
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Qté</th>
                <th>Prix HT</th>
                <th>Prix Total HT</th>
                <th>TVA</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Offres à placer sur la carte</th>
                <th>
                  {bill.nbOffers}
                </th>
                <th>
                  {formatEur(unityPrice)}
                </th>
                <th>
                  {formatEur(withoutTax)}
                </th>
                <th>
                  {bill.tax * 100} %
                </th>
              </tr>
            </tbody>
          </Table>
          <div>
            <p>
              Payée par CB<br />
              <strong>Total HT:</strong> {formatEur(withoutTax)}
              <br />
              <strong>Montant TVA:</strong> {formatEur(bill.price * bill.tax)}
              <br />
              <strong>Total TTC:</strong> {formatEur(bill.price)}
            </p>
          </div>
          <hr style={{marginTop: 100}} />
          <p>
            {bill.address}
            <br />
            RCS Créteil B 817 936 602 - Siret 81793660200017<br />
            NAF 7022Z
          </p>
        </div>
      </Container>
    )
  }
}

export default BillDetail
