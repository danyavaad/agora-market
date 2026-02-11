import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [] as any[],
    }),
    getters: {
        totalItems: (state) => state.items.reduce((acc, item) => acc + item.qty, 0),
        totalPrice: (state) => state.items.reduce((acc, item) => acc + (item.qty * item.price), 0),
    },
    actions: {
        updateQty(product: any, change: number) {
            const idx = this.items.findIndex(i => i.productId === product.id)
            const currentQty = idx > -1 ? this.items[idx].qty : 0
            const newQty = currentQty + change

            const available = product.unitType === 'bunch' || product.unitType === 'unit'
                ? product.marketState.totalAvailableUnits
                : product.marketState.totalAvailableKg

            if (newQty <= 0) {
                if (idx > -1) this.items.splice(idx, 1)
            } else {
                if (newQty > available) return

                if (idx > -1) {
                    this.items[idx].qty = newQty
                } else {
                    this.items.push({
                        productId: product.id,
                        name: product.name,
                        price: product.estimatedPricePerUnit || product.pricePerKg || product.pricePerBunch || 2.50,
                        qty: newQty,
                        unitType: product.unitType,
                        image: (product.marketState?.offerPhotos?.length > 0 ? product.marketState.offerPhotos[0] : (product.imageUrl || null))

                    })
                }
            }
        },
        getQty(id: string) {
            return this.items.find(i => i.productId === id)?.qty || 0
        },
        clear() {
            this.items = []
        }
    }
})
