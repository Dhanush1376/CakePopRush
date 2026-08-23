import { useState, useMemo, useCallback } from 'react'
import { Product } from '@/types/product'
import { useToast } from '@/components/ui/ToastContext'
import { useCart } from '@/features/cart'
import { useWishlist } from '@/features/wishlist'
import { getConfigForProduct } from '../config/productConfigurations'
import { ConfigGroupSchema, InlineOption } from '../config/configurationTypes'

export interface PDPState {
  selectedFlavourId: string | null
  selectedQuantityId: string | null
  selectedAddOns: Set<string>
  selectedInlineOptions: Record<string, string | Set<string>>
  personalMessage: string
  selectedOccasion: string | null
  pincode: string
  deliveryAvailable: boolean | null
  isCheckingDelivery: boolean
  isWishlisted: boolean
  calculatedTotal: number
}

export const usePDPState = (product: Product | undefined) => {
  const { toast } = useToast()

  const [selectedFlavourId, setSelectedFlavourId] = useState<string | null>(
    product?.flavours?.[0]?.id || null
  )
  const [selectedQuantityId, setSelectedQuantityId] = useState<string | null>(
    product?.quantities?.[1]?.id || null // Default to regular box
  )
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())
  const [selectedInlineOptions, setSelectedInlineOptions] = useState<Record<string, string | Set<string>>>({})
  const [personalMessage, setPersonalMessage] = useState('')
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null)
  const [pincode, setPincode] = useState('')
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean | null>(null)
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false)
  const [mascotMessage, setMascotMessage] = useState<string | null>(null)

  const { addItem: addCartItem, openCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  
  const isWishlisted = product ? isInWishlist(product.id) : false

  const handleToggleAddOn = useCallback((id: string) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleToggleInlineOption = useCallback((groupId: string, optionId: string, multiSelect?: boolean) => {
    setSelectedInlineOptions(prev => {
      if (multiSelect) {
        const next = new Set((prev[groupId] as Set<string>) || new Set())
        if (next.has(optionId)) next.delete(optionId)
        else next.add(optionId)
        return { ...prev, [groupId]: next }
      } else {
        return { ...prev, [groupId]: prev[groupId] === optionId ? '' : optionId }
      }
    })
  }, [])

  const handleCheckDelivery = useCallback(async (code: string) => {
    setIsCheckingDelivery(true)
    setDeliveryAvailable(null)
    setPincode(code)
    
    // Mock API call
    setTimeout(() => {
      setIsCheckingDelivery(false)
      // Simulate success for most pincodes, failure for some
      setDeliveryAvailable(code.length === 6 && code !== '000000')
    }, 1200)
  }, [])

  const calculatedTotal = useMemo(() => {
    if (!product) return 0
    let total = product.basePrice

    const flavour = product.flavours?.find(f => f.id === selectedFlavourId)
    if (flavour) {
      total += flavour.priceModifier
    }

    const quantity = product.quantities?.find(q => q.id === selectedQuantityId)
    if (quantity) {
      total += quantity.priceModifier
    }

    product.addOns?.forEach(addon => {
      if (selectedAddOns.has(addon.id)) {
        total += addon.price
      }
    })

    const configGroups = getConfigForProduct(product)
    configGroups.forEach((group: ConfigGroupSchema) => {
      if (group.type === 'inline' && group.inlineOptions) {
        const selected = selectedInlineOptions[group.id]
        if (selected) {
          group.inlineOptions.forEach((opt: InlineOption) => {
            if (group.multiSelect) {
              if ((selected as Set<string>).has(opt.id)) total += opt.priceDelta
            } else {
              if (selected === opt.id) total += opt.priceDelta
            }
          })
        }
      }
    })

    return total
  }, [product, selectedFlavourId, selectedQuantityId, selectedAddOns, selectedInlineOptions])

  const handleAddToCart = useCallback(() => {
    if (!product) return

    const selectedFlavour = product.flavours?.find(f => f.id === selectedFlavourId)
    addCartItem({
      product: product,
      quantity: 1,
      variantName: selectedFlavour?.name
    })
    
    toast({
      type: 'success',
      title: 'Added to your sweet box!'
    })
    setMascotMessage('Yay! Added to your cart!')
    setTimeout(() => setMascotMessage(null), 3000)
    
    openCart()
  }, [product, calculatedTotal, addCartItem, openCart, toast])

  const handleToggleWishlist = useCallback(() => {
    if (!product) return

    if (isWishlisted) {
      removeFromWishlist(product.id)
      toast({
        type: 'info',
        title: 'Removed from Wishlist'
      })
    } else {
      addToWishlist(product)
      toast({
        type: 'success',
        title: 'Added to Wishlist',
        message: 'We saved this for later.'
      })
      setMascotMessage('Ooh, saving it for a special day!')
      setTimeout(() => setMascotMessage(null), 3000)
    }
  }, [product, isWishlisted, addToWishlist, removeFromWishlist, toast])



  // Mascot interactions
  const handleFlavourChange = useCallback((id: string | null) => {
    setSelectedFlavourId(id)
    if (id) {
      const flavour = product?.flavours?.find(f => f.id === id)
      if (flavour) {
        setMascotMessage(`Ooh, ${flavour.name} is a great choice!`)
        setTimeout(() => setMascotMessage(null), 3000)
      }
    }
  }, [product])

  const handleOccasionChange = useCallback((id: string) => {
    setSelectedOccasion(id)
    setMascotMessage(`Perfect for a ${id}!`)
    setTimeout(() => setMascotMessage(null), 3000)
  }, [])

  return {
    state: {
      selectedFlavourId,
      selectedQuantityId,
      selectedAddOns,
      personalMessage,
      selectedOccasion,
      pincode,
      deliveryAvailable,
      isCheckingDelivery,
      isWishlisted,
      calculatedTotal,
      mascotMessage,
      selectedInlineOptions
    },
    actions: {
      setSelectedFlavourId: handleFlavourChange,
      setSelectedQuantityId,
      toggleAddOn: handleToggleAddOn,
      toggleInlineOption: handleToggleInlineOption,
      setPersonalMessage,
      setSelectedOccasion: handleOccasionChange,
      checkDelivery: handleCheckDelivery,
      addToCart: handleAddToCart,
      toggleWishlist: handleToggleWishlist,
      setMascotMessage
    }
  }
}
