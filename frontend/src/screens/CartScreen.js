import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, removeFromCart } from '../actions/cartActions'
import Message from '../components/Message'
import { Row, Col, Card, ListGroup, Image, Button } from 'react-bootstrap'
import SelectList from '../UI/selectListFromNumber'
import { Link } from 'react-router-dom'

const CartScreen = ({ match, location }) => {
  const dispatch = useDispatch()
  const cart = useSelector(state => state.cart)
  const { cartItems } = cart
  const { id } = match.params
  const quantity = location.search ? Number(location.search.split("=")[1]) : 1
  useEffect(() => {
    if(id){
      dispatch(addToCart(id, quantity))
    }
  }, [dispatch, id, quantity]);

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id))
  }

  const checkoutHandler = () => {
    console.log('checkout')
  }

  return (
    <Row>
      <Col md={8}>
        <h1>Shopping cart</h1>
        { cartItems.length === 0 
          ? (<Message>Your cart is empty<Link style={{color: 'red', float: 'right'}} to='/'>Go back</Link></Message>)
          : (<ListGroup variant='flush'>
              {cartItems.map(item => {
                return (
                <ListGroup.Item key={item.product}>
                  <Row>
                    <Col md={2}>
                      <Image src={item.image} alt={item.name} fluid rounded/>
                    </Col>
                    <Col md={3}>
                      <Link to={`/products/${item.product}`}>{item.name}</Link>
                    </Col>
                    <Col md={2}>{item.price}</Col>
                    <Col md={2}>
                      {// <select as="select"
                      //         style={{ background: '#F7F7F9',  
                      //                  border: '0px',
                      //                  outline: '0px'}}
                      //               defaultValue={item.qty}
                      //               onChange={(e) => dispatch(addToCart(item.product, Number(e.target.value)))}>
                      //               {[...Array(item.countInStock).keys()].map(el => (
                      //                 <option key={el+1} 
                      //                         value={el+1}
                      //                         variant="info">{el+1}</option>
                      //               ))}
                      // </select>
                      }
                      <SelectList value={item.qty}
                                  size={item.countInStock}
                                  change={(quant) => dispatch(addToCart(item.product, quant))}/> 
                    </Col>
                    <Col md={2}>
                      <Button
                        type="button"
                        variant="light"
                        onClick={() => removeFromCartHandler(item.product)}>
                        <i className='fas fa-trash'></i></Button>
                    </Col>
                  </Row>
                </ListGroup.Item>)
              })}
             </ListGroup>)
        }
      </Col>
      <Col md={4}>
        <Card>
          <ListGroup>
            <ListGroup.Item>
              <h2>Subtotal ({cartItems.reduce((acc, item) => acc+item.qty, 0)}) items</h2>
              ${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
            </ListGroup.Item>
            <ListGroup.Item>
              <Button 
                type="button"
                className="btn-block"
                onClick={() => checkoutHandler()}
                disabled={cartItems.length === 0}>Proceed to checkout</Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  )
}

export default CartScreen