import { useState, useEffect } from "react"
import * as XLSX from 'xlsx'
import axios from 'axios'


function App () {
const [products, setProducts] = useState([])
const [cart, setCart] = useState({})
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
const [selectedCategory, setSelectedCategory] = useState(null)

useEffect(() => {
const EXCEL_URL = 'https://docs.google.com/spreadsheets/d/1Kz-kNPTNl1Loqrwj3B1iuIL5fZRUkFHL/export?format=xlsx'

loadExcelFromUrl(EXCEL_URL)
},[])

const loadExcelFromUrl = async(url) => {
  setLoading(true)
  setError(null)
  
try{
  console.log(`loading data from excel`)
  const response = await fetch(url)

  const arrayBuffer = await response.arrayBuffer()

  const workbook = XLSX.read(arrayBuffer, {type:'array'})

  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]

  const jsonData = XLSX.utils.sheet_to_json(worksheet)

  console.log('Raw data from Excel:', jsonData)

  const validProducts = jsonData.map(row => ({
    
    
    id:Number(row.id),
    name:String(row.name || '').trim(),
    brand:String(row.brand || '').trim(),
    category:String(row.category || 'other').trim(),
    price:Number(row.price) || 0,
    description:String(row.description).trim(),
    image: String(row.image).trim()
     .trim()
      .replace(/\s/g, ''),
    imageAlt:row.imageAlt
})
  )

  
  console.log('Products from excel', validProducts)
   setProducts(validProducts)
   setLoading(false)
}catch (err) {
console.error('Error loading Excel', err)
setError('could not load excel. Please check the excel file url')
setLoading(false)
}

}

const updateQuantity = (productId, change) => {
  setCart(prev => ({
    ...prev,
    [productId]: Math.max(0, (prev[productId] || 0) + change)
  })

  )}

  const getTotalItems = () => {
   return Object.values(cart).reduce((sum,qty) => sum + qty, 0)
  }

  const getTotalprice = () => {
    return Object.entries(cart).reduce((sum, [productId, qty]) => {
      const product = products.find(p => p.id === parseInt(productId))
      return sum + (product? product.price*qty:0)
    },0)
  }


const categories = [...new Set(products.map(p => p.category))]

const getProductsByCategory = (category) => {
return products.filter(p => (p.category === category))

}

const handleWhatsAppOrder = async () => {
  const orderItems = Object.entries(cart)
    .filter(([productId, qty]) => qty > 0)
    .map(([productId, qty]) => {
      const product = products.find(p => p.id === parseInt(productId))
      return {
        name: product.name,
        qty,
        price: product.price,
        image: product.image || null
      };
    });

  if (orderItems.length === 0) {
    alert('Your cart is empty');
    return;
  }

  const order = {
    customerName: "Website Order", // You can change this dynamically later
    total: getTotalprice(),
    items: orderItems
  };

  try {
    const res = await axios.post("http://localhost:5000/send-order", { order });
    if (res.data.success) {
      alert("✅ Order sent successfully to WhatsApp group!");
      setCart({}); // clear cart after sending
    } else {
      alert("⚠️ Failed to send order: " + (res.data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("❌ Error sending order:", err);
    alert("Error sending order. Check backend connection.");
  }
};
  
  if (loading) {
return(
  <div style={{
    textAlign:'centre',
    display:'flex',
    minHeight:'100vh',
    alignItems:'center',
    justifycontent:'center',
    background:'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
    <div style={{fontSize:'48px', marginBottom:'20px'}}>⏳</div>
    <h2 style={{color:'#0B5FFF'}}>loading Products...</h2>
    <p style={{color:'#666'}}>Please wait</p>
  </div>
)
}

if (error){
  return(
    <div style={{textAlign:'center', padding:'50px', color:'red'}}>
      <div style={{
        textAlign:'center',
        backgroundColor:'white',
        padding:'40px',
        borderRadius:'12px',
        boxShadow:'0 4px 12px rgba(0,0,0,0.1)',
        maxWidth:'500px'
      }}>
        <div style={{
          minHeight:'100vh',
          display:'flex',
          justifyContent:'center',
          alignItems:'center',
          background:'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'

        }}>⚠️</div>
      <h2 style={{color:'#ff4444', marginBottom:'10px'}}>Error:Loading products</h2>
      <p style={{color:'#666', marginBottom:'20px'}}>{error}</p>
      <button
      style={{
        backgroundColor:'#0B5FFF',
        color:'white',
        padding:'12px 24px',
        border:'none',
        borderRadius:'20px',
        cursor:'pointer',
        fontSize:'16px'
      }}
      onClick={() => window.location.reload()}
      >Try Again</button>
      </div>
    </div>
  )

}
const ProductCard = ({product}) => {
  return (
  <div style={{
    border:'1px solid #ddd',
    borderRadius:'10px',
    overflow:'hidden',
    backgroundColor:'white',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    width:'100%',
    maxWidth:'200px',
    transition: 'transform 0.2s',
  }}>
    {/*Product display*/}
  {product.image && (
  <img style={{
    width:'100%',
    height:'130px',
    objectFit:'contain',
    backgroundColor: '#f8f8f8',
    borderBottom:'1px solid  #eee',
    padding:'6px',
    display:'block'
  }}
  src={product.image}
  alt={product.name}
   OnError ={(e) => {
    console.log('Primary url failed trying alternative', product.name)
    if (p.imageAlt) {
        e.target.src = product.imageAlt
    }else {
    e.target.src = 'https://via.placeholder.com/200x200/0B5FFF/FFFFFF?text=' + encodeURIComponent(product.name.substring(0, 15))}
      console.log('✅ Image loaded:', product.name)
    }
   }
/>)}

{/*Product Info*/}
<div style={{padding:'8px'}}>
  <h2 style={{margin:'0 0 4px 0', fontSize:'13px',color:'red'}}>{product.name}</h2>
  <p style={{margin:'0 0 4px 0', fontSize:'12px,', color:'#666'}}>{product.price}</p>
  <p style = {{margin:'0 0 8px 0', fontSize:'11px,', color:'#888'}}>{product.description}</p>

  {/*price and buttons*/}
  <div style={{
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center'
  }}>
    <span
    style={{fontSize:'14px', fontWeight:'bold', color:'#0B5FFF'
    }}
    >
      UGX-{product.price.toLocaleString()}
    </span>

    {/*Add/Remove Buttons*/}
    <div
    style={{display:'flex', alignItems:'center', gap:'8px'}}
    >
      <button
      style={{
        width:'26px',
        height:'26px',
        background: cart[product.id] >  0 ? '#ff4444' : '#ccc',
        cursor: cart[product.id] > 0 ? 'pointer':'not-allowed',
        borderRadius:'50%',
        border:'none',
        color:'white',
        fontSize:'16px',
        display:'flex',
        alignItems:'center',
        justifyContent:'center'
      }}
      onClick={() => updateQuantity(p.name, -1)}
      disabled = {!cart[product.id]}
      >-</button>
      <span style={{minWidth:'18px', textAlign:'center', fontWeight:'bold', color:'red'}}>{cart[product.id] || 0}</span>
      <button style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: 'none',
                background: '#25D366',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                display:'flex',
                alignItems:'center',
                justifyContent:'center'
      }}
      onClick={() => updateQuantity(product.id, 1)}
      >+</button>
    </div>
  </div>
</div>
  </div>
  )
} 

const CategorySection = ({categoryName, showAll=false}) => {
const categoryProducts = getProductsByCategory(categoryName)
const displayProducts = showAll? categoryProducts:categoryProducts.slice(0,3)

return(
  <div style={{marginBottom:'50px'}}>
    <div style={{
      display:'flex',
      alignItems:'center',
      justifyContent:'space-between',
      marginBottom:'20px',
      borderBottom:'2px solid  #0B5FFF',
      paddingBottom:'10px'
    }}>
{/*product header*/}
<h2 style={{margin:'0', color: '#0B5FFF'}}>
    {categoryName} {categoryProducts.length}
  </h2>
{!showAll && categoryProducts.length > 6 &&(
  <button
  style={{
    background: '#0B5FFF',
    color:'white',
    border:'none',
    borderRadius:'12px',
    cursor:'pointer',
    padding:'8px 16px'
  }}
  onClick={() => setSelectedCategory(categoryName)}
  >
    See All →
  </button>
)}
</div>

<div style={{
  display:'grid',
  gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))',
  gap:'30px',
  justifyItems:'center'

}}>
  {/*Grid display*/}
  {displayProducts.map(product =>(
    <ProductCard key={product.id} product={product}/>
  ))}
</div>
  </div>
)
}
if (selectedCategory) {
  return (
  <div>
    <div>
      {/*Back button and Cart*/}
      <div>
        <button
        onClick={() => setSelectedCategory(null)}
        >
          Back to All categories
        </button>
        {getTotalItems() > 0 && (
          <button
          onClick={() => handleWhatsAppOrder()}
          >
              📱 Order {getTotalItems()} Items (UGX {getTotalprice().toLocaleString()})
          </button>
        )}
      </div>
      {/*Show all Products*/}
      <CategorySection categoryName={selectedCategory} showAll={true}/>
    </div>
  </div>
  )
}
return (
  <div>
    <div>
      <div>
        {/*Header*/}
        <h1>🛒 Kookee Product Catalog</h1>
        <p>Premium Cosmetic Oils, Fresh Dairy & Quality Spices</p>
        <p>{products.length} products Available</p>
      </div>
      
      {/*Cart summary bar( only shows if cart) */}
      {getTotalItems() > 0 && (
        <div>
          <div>
        <h3>
          🛍️ Your Cart:{getTotalItems()} items
        </h3>
        <p>Total:UGX {getTotalprice().toLocaleString()}</p>
        </div>
        <button
        onClick={() => handleWhatsAppOrder()}
        >
          📱 Order via WhatsApp
        </button>
        </div>
      )}
      
      {/*All categories*/}
      {categories.map(category => (
      <CategorySection key={category} categoryName={category}/>
      ))}
    </div>
  </div>
)
}
export default App;