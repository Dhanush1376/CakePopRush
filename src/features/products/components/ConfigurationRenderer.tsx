import React from 'react'
import { Product } from '@/types/product'
import { getConfigForProduct } from '../config/productConfigurations'
import { ConfigGroupSchema } from '../config/configurationTypes'
import { PDPState } from '../hooks/usePDPState'
import { Accordion } from '@/components/ui/Accordion'
import { ShoppingBag, Tag, Palette, MessageSquareHeart, Gift, Sparkles } from 'lucide-react'

// Selectors
import { QuantitySelector } from './QuantitySelector'
import { AddOnSelector } from './AddOnSelector'
import { FlavourSelector } from './FlavourSelector'
import { OccasionSelector } from './OccasionSelector'
import { PersonalizationSection } from './PersonalizationSection'
import { InlineOptionSelector } from './InlineOptionSelector'

import styles from './ConfigurationRenderer.module.css'

interface ConfigurationRendererProps {
  product: Product
  state: PDPState
  actions: any // We'll pass the whole actions object from usePDPState
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'ShoppingBag': return <ShoppingBag size={14} />
    case 'Tag': return <Tag size={14} />
    case 'Palette': return <Palette size={14} />
    case 'MessageSquareHeart': return <MessageSquareHeart size={14} />
    case 'Gift': return <Gift size={14} />
    case 'Sparkles': return <Sparkles size={14} />
    default: return <Tag size={14} />
  }
}

export const ConfigurationRenderer = ({ product, state, actions }: ConfigurationRendererProps) => {
  const configGroups = getConfigForProduct(product)

  if (configGroups.length === 0) return null

  const renderGroupContent = (group: ConfigGroupSchema) => {
    switch (group.type) {
      case 'quantity':
        return (
          <QuantitySelector
            quantities={product.quantities}
            selectedId={state.selectedQuantityId}
            onChange={actions.setSelectedQuantityId}
            basePrice={product.basePrice + (product.flavours?.find(f => f.id === state.selectedFlavourId)?.priceModifier || 0)}
          />
        )
      case 'flavour':
        return (
          <FlavourSelector
            flavours={product.flavours}
            selectedId={state.selectedFlavourId}
            onChange={actions.setSelectedFlavourId}
          />
        )
      case 'addon':
        return (
          <AddOnSelector
            addOns={product.addOns}
            selectedAddOns={state.selectedAddOns}
            onToggle={actions.toggleAddOn}
          />
        )
      case 'occasion':
        return (
          <OccasionSelector
            occasions={product.occasions}
            selectedOccasion={state.selectedOccasion}
            onChange={actions.setSelectedOccasion}
          />
        )
      case 'message':
        return (
          <PersonalizationSection
            message={state.personalMessage}
            onChange={actions.setPersonalMessage}
          />
        )
      case 'inline':
        return (
          <InlineOptionSelector
            options={group.inlineOptions}
            selectedIds={state.selectedInlineOptions?.[group.id] || (group.multiSelect ? new Set<string>() : '')}
            onChange={(optionId) => actions.toggleInlineOption(group.id, optionId, group.multiSelect)}
            multiSelect={group.multiSelect}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      {configGroups.map((group, index) => (
        <Accordion
          key={group.id}
          title={`${index + 1}. ${group.title}`}
          icon={getIcon(group.icon)}
          isRequired={group.required}
          isDefaultOpen={index === 0}
        >
          {group.subtitle && <p className={styles.subtitle}>{group.subtitle}</p>}
          {renderGroupContent(group)}
        </Accordion>
      ))}
    </>
  )
}
