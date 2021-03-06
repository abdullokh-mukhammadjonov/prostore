import { 
  CART_ADD_ITEM, 
  CART_REMOVE_ITEM,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
  CART_RESET } from '../constants/cartConstants'

const cartReducer = (state = { cartItems: [], shippingAddress: {}, paymentMethod: '' }, action) => {
  // cartItems: [ {count: 5, product: {...}} ]
  switch(action.type){
    case CART_ADD_ITEM:
      const item = action.payload
      const exists = state.cartItems.find(i => i.product === item.product)

      if(exists) {
        return {
          ...state,
          cartItems: state.cartItems.map(i => i.product === item.product ? item : i)
        }
      } else {
        return {
          ...state, cartItems: [...state.cartItems, item]
        }
      }

    case CART_REMOVE_ITEM:
      const id = action.payload
      return {
        ...state,
        cartItems: state.cartItems.filter(i => i.product !== id)
      }

    case CART_SAVE_SHIPPING_ADDRESS:
      return {
        ...state,
        shippingAddress: action.payload
      }    


    case CART_SAVE_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload
      }


    case CART_RESET:
      return {
        cartItems: [], shippingAddress: {}, paymentMethod: ''
      }


    default:
      return state
  }
}

export default cartReducer