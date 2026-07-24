/**
 * Bottom sheet that slides up when customer clicks an item on the order page.
 *
 * UX rules:
 * - Protein swap: radio buttons (pick ONE)
 * - Ingredients: toggle chips (tap to remove, tap again to add back)
 *   Green chip = included in the item
 *   Red chip with × = removed from the item
 * - Extras: checkbox rows (pick any combination)
 * - Notes: free text field
 * - Price updates live as customer customizes
 * - "Add to order" button fixed at the bottom
 */

'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { useTranslations } from 'next-intl'
import { getAddonById } from '@/data/menu'
import type { MenuItem, ProteinSwap } from '@/types/menu'
import type { SelectedAddon } from '@/types/order'

type ItemCustomizationModalProps = {
  item: MenuItem
  isOpen: boolean
  onClose: () => void
}

const SAUCE_ADDON_PRICE = 10

export default function ItemCustomizationModal({
  item,
  isOpen,
  onClose,
}: ItemCustomizationModalProps) {
  const { addCustomizedItem } = useCart()
  const t = useTranslations()

  const [selectedSwap, setSelectedSwap] = useState<ProteinSwap | null>(null)
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([])
  const [addedSauce, setAddedSauce] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([])
  const [instructions, setInstructions] = useState('')

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const proteinDelta = selectedSwap?.priceDelta ?? 0
  const saucePrice = addedSauce ? SAUCE_ADDON_PRICE : 0
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0)
  const totalPrice = item.price + proteinDelta + saucePrice + addonsTotal

  function toggleIngredient(ingredient: string) {
    setRemovedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    )
  }

  function toggleAddon(addonId: string) {
    const addonItem = getAddonById(addonId)
    if (!addonItem) return
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.menuItemId === addonId)
      if (exists) return prev.filter(a => a.menuItemId !== addonId)
      return [...prev, {
        menuItemId: addonId,
        name: t(addonItem.nameKey),
        price: addonItem.price,
      }]
    })
  }

  function handleAddToCart() {
    addCustomizedItem({
      menuItemId: item.id,
      name: t(item.nameKey),
      basePrice: item.price,
      proteinSwap: selectedSwap,
      removedIngredients,
      addedSauce,
      addons: selectedAddons,
      specialInstructions: instructions,
    })
    handleClose()
  }

  function handleClose() {
    onClose()
    // Reset all state after close animation
    setTimeout(() => {
      setSelectedSwap(null)
      setRemovedIngredients([])
      setAddedSauce(false)
      setSelectedAddons([])
      setInstructions('')
    }, 300)
  }

  return (
    <>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black/70 z-40"
        onClick={handleClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111] rounded-t-xl flex flex-col max-h-[90vh] md:max-w-lg md:mx-auto md:left-1/2 md:-translate-x-1/2">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Item header */}
        <div className="px-5 pb-4 border-b border-white/10 shrink-0">
          <div className="flex justify-between items-start">
            <h2 className="font-display text-white text-2xl uppercase tracking-wide">
              {t(item.nameKey)}
            </h2>
            <button
              onClick={handleClose}
              className="text-white/40 hover:text-white text-2xl leading-none ml-4 shrink-0"
            >
              ×
            </button>
          </div>
          <p className="text-white/40 text-xs uppercase tracking-wide mt-1">
            {t(item.descriptionKey)}
          </p>
        </div>

        {/* Scrollable options */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-6">

          {/* Protein swap — radio buttons */}
          {item.customization.proteinSwaps.length > 0 && (
            <section>
              <h3 className="text-xs text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                {t('modal.swapProtein')}
                <span className="text-white/20 normal-case tracking-normal font-body">
                  — {t('modal.pickOne')}
                </span>
              </h3>
              <div className="flex flex-col gap-2">

                {/* Keep original option */}
                <label className="flex items-center justify-between px-4 py-3 rounded-sm border cursor-pointer transition-colors border-white/10 hover:border-white/25">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="protein"
                      checked={selectedSwap === null}
                      onChange={() => setSelectedSwap(null)}
                      className="accent-brand-gold"
                    />
                    <span className="text-white text-sm">
                      {t('modal.keepOriginal')}
                    </span>
                  </div>
                  <span className="text-white/40 text-sm">
                    {t('modal.included')}
                  </span>
                </label>

                {/* Swap options */}
                {item.customization.proteinSwaps.map(swap => (
                  <label
                    key={swap.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-sm border cursor-pointer transition-colors ${
                      selectedSwap?.id === swap.id
                        ? 'border-brand-gold/60 bg-brand-gold/8'
                        : 'border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="protein"
                        checked={selectedSwap?.id === swap.id}
                        onChange={() => setSelectedSwap(swap)}
                        className="accent-brand-gold"
                      />
                      <span className="text-white text-sm">
                        {swap.name}
                      </span>
                    </div>
                    <span className={`text-sm ${
                      swap.priceDelta === 0
                        ? 'text-white/40'
                        : 'text-brand-gold'
                    }`}>
                      {swap.priceDelta === 0
                        ? t('modal.free')
                        : `+${swap.priceDelta} kr`}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Ingredient toggle chips — Option A */}
          {item.customization.ingredients.length > 0 && (
            <section>
              <h3 className="text-xs text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                {t('modal.removeIngredients')}
                <span className="text-white/20 normal-case tracking-normal font-body">
                  — {t('modal.tapToRemove')}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.customization.ingredients.map(ingredient => {
                  const isRemoved = removedIngredients.includes(ingredient)
                  return (
                    <button
                      key={ingredient}
                      onClick={() => toggleIngredient(ingredient)}
                      className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-wide font-body border transition-all duration-150 ${
                        isRemoved
                          ? 'border-red-500/60 bg-red-500/10 text-red-400'
                          : 'border-green-500/40 bg-green-500/8 text-green-400'
                      }`}
                    >
                      {isRemoved ? '✕ ' : '✓ '}{ingredient}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-white/25 mt-2">
                {t('modal.removalNote')}
              </p>
            </section>
          )}

          {/* Extras — checkbox rows */}
          {(item.customization.hasSauceAddon ||
            item.customization.addonIds.length > 0) && (
            <section>
              <h3 className="text-xs text-white/40 uppercase tracking-widest mb-3">
                {t('modal.addExtras')}
              </h3>
              <div className="flex flex-col gap-2">

                {/* Sauce addon */}
                {item.customization.hasSauceAddon && (
                  <label className={`flex items-center justify-between px-4 py-3 rounded-sm border cursor-pointer transition-colors ${
                    addedSauce
                      ? 'border-brand-gold/60 bg-brand-gold/8'
                      : 'border-white/10 hover:border-white/25'
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={addedSauce}
                        onChange={() => setAddedSauce(!addedSauce)}
                        className="accent-brand-gold"
                      />
                      <div>
                        <p className="text-white text-sm">
                          {t('modal.sauceLabel')}
                        </p>
                        <p className="text-white/35 text-xs mt-0.5">
                          {t('modal.sauceNote')}
                        </p>
                      </div>
                    </div>
                    <span className="text-brand-gold text-sm shrink-0 ml-4">
                      +10 kr
                    </span>
                  </label>
                )}

                {/* Other addons */}
                {item.customization.addonIds.map(addonId => {
                  const addon = getAddonById(addonId)
                  if (!addon) return null
                  const isSelected = selectedAddons.some(
                    a => a.menuItemId === addonId
                  )
                  return (
                    <label
                      key={addonId}
                      className={`flex items-center justify-between px-4 py-3 rounded-sm border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-brand-gold/60 bg-brand-gold/8'
                          : 'border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAddon(addonId)}
                          className="accent-brand-gold"
                        />
                        <span className="text-white text-sm">
                          {t(addon.nameKey)}
                        </span>
                      </div>
                      <span className="text-brand-gold text-sm shrink-0 ml-4">
                        +{addon.price} kr
                      </span>
                    </label>
                  )
                })}
              </div>
            </section>
          )}

          {/* Notes and allergies */}
          <section>
            <h3 className="text-xs text-white/40 uppercase tracking-widest mb-3">
              {t('modal.instructions')}
            </h3>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder={t('modal.instructionsPlaceholder')}
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-sm px-3 py-2 text-sm text-white placeholder:text-white/25 resize-none focus:outline-none focus:border-brand-gold/40"
            />
          </section>
        </div>

        {/* Sticky footer — always visible */}
        <div className="px-5 py-4 border-t border-white/10 bg-[#111] shrink-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/50 text-sm uppercase tracking-widest">
              {t('modal.total')}
            </span>
            <span className="font-display text-2xl text-brand-gold">
              {totalPrice} kr
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-brand-gold text-brand-black font-display text-lg uppercase tracking-widest rounded-sm hover:bg-yellow-400 transition-colors"
          >
            {t('modal.addToCart')}
          </button>
        </div>
      </div>
    </>
  )
}
