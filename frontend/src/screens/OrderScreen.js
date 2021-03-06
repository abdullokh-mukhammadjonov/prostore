import { useEffect, useState } from 'react'
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { PayPalButton } from 'react-paypal-button-v2'
import Message from '../components/Message'
import { Link } from 'react-router-dom'
import axios from 'axios'
import Loader from '../components/Loader'
import { getOrderDetails, payOrder, deliverOrder } from '../actions/orderActions'
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from '../constants/orderConstants'


const OrderScreen = ({ match, history }) => {
  const [paypalError, setPaypalError] = useState(false)
  const userLogin = useSelector(state => state.userLogin)
  const { userInfo } = userLogin

  // dispatcher
  const dispatch = useDispatch()

  // PayPal sdk state
  const [sdkReady, setSdkReady] = useState(false)

  // id
  const orderId = match.params.id

  // order details from global state
  const orderDetails = useSelector(state => state.orderDetails)
  const { loading, error, order } = orderDetails

  // order details from global state
  const orderPay = useSelector(state => state.orderPay)
  const { loading: loadingPay, success: successPay } = orderPay

  const orderDeliver = useSelector(state => state.orderDeliver)
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver

  useEffect(() => {
    if(!userInfo) {
      history.push('/signin')
    }
    const addPayPalScript = async () => {
      try {
        const { data } = await axios.get('/api/config/paypal')

        if(!data.clientId)
          throw new Error('Could not connect to paypal')

        const { clientId } = data;

        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`
        script.async = true
        script.onload = () => {
          setSdkReady(true)
        }
        document.body.appendChild(script)

      } catch(error) {
        setPaypalError(true)
      }
    }

    // if payment is done successfully ||
    // if deliver is done successfully ||
    // there is no order in the state   ||
    // the order came through params is different than the one in the state 
    if(!order || (order._id !== orderId) || successPay || successDeliver) {

       // to prevent infinite loop
      dispatch({ type: ORDER_PAY_RESET })
      dispatch({ type: ORDER_DELIVER_RESET })

      // dispatching the order
      dispatch(getOrderDetails(orderId))

    } else if(!order.isPaid) { // ? not paid
      if(!window.paypal) { // ? script is not added
        addPayPalScript() // add script
      } else { // ? paypal is added already
        setSdkReady(true) // sdk is ready
      }
    }
  }, [dispatch, userInfo, history, orderId, order, successPay, successDeliver])


  // calculating the prices
  if(!loading && order){
    const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2)
    }
    order.itemsPrice = addDecimals(order.orderItems.reduce(
      (acc, item) => acc + item.price * item.qty, 0)
    )
  }


  const paymentSuccessHandler = (paymentResult) => {
    dispatch(payOrder(orderId, paymentResult))
  }  


  const deliverHandler = () => {
    dispatch(deliverOrder(order._id))
  }
  

  return (
    loading || loadingDeliver
        ? ( <Loader /> )
        : (error ? <Message variant='danger'>{error}</Message>
        : order ? <>
              <h1>Order {order._id}</h1>
              <Row>  
                <Col md={8}>
                  <ListGroup variant='flush'>
                    <ListGroup.Item>
                      <h2>Shipping</h2>
                      <p>
                        <strong>Name: </strong>
                        { order.user.name }
                      </p>
    
                      <p>
                        <strong>Email: </strong>
                        <a href={`mailto:${order.user.email}`}>{ order.user.email }</a>
                      </p>
    
                      <p>
                        <strong>Address: </strong>
                        { order.shippingAddress.address }, { order.shippingAddress.city }{'  '}, {  order.shippingAddress.postalCode }{'  '}, { order.shippingAddress.country }
                      </p>
    
                      { order.isDelivered ? <Message variant='success'>Delivered on {order.deliveredAt.substr(0, 10)}</Message> 
                                     : <Message variant='danger'>Not delivered</Message>}
                    </ListGroup.Item>
        
        
                    <ListGroup.Item>
                      <h2>Payment Method</h2>
                      <p>
                        <strong>Method: </strong>
                        { order.paymentMethod }
                      </p>
    
                      { order.isPaid ? <Message variant='success'>Paid on {order.paidAt.substr(0, 10)}</Message> 
                                     : <Message variant='danger'>Not paid</Message>}
                    </ListGroup.Item>
        
        
                    <ListGroup.Item>
                      <h2>Order Items</h2>
                      { order.orderItems.length === 0
                      ? <Message>Order is empty</Message> 
                      : (
                        <ListGroup variant='flush'>
                          {
                            order.orderItems.map((item, index) => {
                              return (
                              <ListGroup.Item key={index}>
                                <Row>
                                  <Col md={1}>
                                    <Image src={item.image} alt={item.name} fluid rounded/>
                                  </Col>
        
                                  <Col>
                                    <Link to={`/products/${item.product}`}>
                                      { item.name }
                                    </Link>
                                  </Col>
        
                                  <Col md={4}>
                                    { item.qty } x ${item.price} = ${item.qty * item.price}
                                  </Col>
                                </Row>
                              </ListGroup.Item>)
                            })
                          }
                        </ListGroup>
                      )}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
        
        
                <Col md={4}>
                  <Card>
                    <ListGroup variant='flush'>
                      <ListGroup.Item>
                        <Row>
                          <Col>Order Summary</Col>
                        </Row>
                      </ListGroup.Item>
        
        
                      <ListGroup.Item>
                        <Row>
                          <Col>Items</Col>
                          <Col>${order.itemsPrice}</Col>
                        </Row>
                      </ListGroup.Item>
        
        
                      <ListGroup.Item>
                        <Row>
                          <Col>Shipping</Col>
                          <Col>${order.shippingPrice}</Col>
                        </Row>
                      </ListGroup.Item>
        
        
                      <ListGroup.Item>
                        <Row>
                          <Col>Tax</Col>
                          <Col>${order.taxPrice}</Col>
                        </Row>
                      </ListGroup.Item>
        
        
                      <ListGroup.Item>
                        <Row>
                          <Col>Total</Col>
                          <Col>${order.totalPrice}</Col>
                        </Row>
                      </ListGroup.Item>
                    </ListGroup>
    
                    {userInfo && !userInfo.isAdmin && !order.isPaid && (
                      <ListGroup.Item>
                        { loadingPay && <Loader /> }
                        { !sdkReady 
                          ? (<Loader />) 
                          : (!paypalError ? <PayPalButton amount={order.totalPrice} 
                                             onSuccess={paymentSuccessHandler}/>
                                          : <Message variant='danger'>Could not connect to paypal</Message>)}
                      </ListGroup.Item>
                      ) }


                    {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                      <ListGroup.Item>
                          <Button type='button' 
                                  className='btn btn-block'
                                  onClick={deliverHandler}>Mark as delivered</Button>
                      </ListGroup.Item>
                      ) }
        
                  </Card>
                </Col>
              </Row>
            </> : <h6>order</h6>)
      )
}

export default OrderScreen