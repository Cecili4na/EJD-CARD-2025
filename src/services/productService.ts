// Serviço para gerenciar produtos no localStorage

import { supabase } from '../lib/supabase'

export type Product = {
  id: string | null // alterado de number para string
  name: string
  price: number
  stock: number
  image?: string | null
  category?: string | null
  [key: string]: any
}

export const productService = {
  // Retorna array de produtos (nunca undefined)
  getProducts: async (category: 'lojinha' | 'lanchonete'): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true })

      if (error) {
        console.error('productService.getProducts error:', error)
        return []
      }

      // garante retorno consistente
      return data ?? []
    } catch (err) {
      console.error('productService.getProducts unexpected error:', err)
      return []
    }
  },

  // Deleta produto e retorna boolean indicando sucesso
  deleteProduct: async (_category: string, id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('productService.deleteProduct error:', error)
        return false
      }
      return true
    } catch (err) {
      console.error('productService.deleteProduct unexpected error:', err)
      return false
    }
  },

  // Opcional: buscar um produto por id (útil para edição)
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from<Product>('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('productService.getProductById error:', error)
        return null
      }
      return data ?? null
    } catch (err) {
      console.error('productService.getProductById unexpected error:', err)
      return null
    }
  },

  //Salva imagem do produto no storage do supabase
  async uploadProductImage(file: File): Promise<string | null> {
    try {
      if (!file) {
        console.error('No file provided for upload');
        return null;
      }

      // Generate unique filename
      const fileExt = file.type.split('/').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload process failed:', error);
      return null;
    }
  },

  async saveProduct(category: 'lojinha' | 'lanchonete', product: Product, newImageFile: File | null, existingImageUrl: string | null | undefined): Promise<Product | null> {
    try {      
      // Handle image upload if file exists
      let imageUrl = existingImageUrl;
      if (newImageFile instanceof File) {
        imageUrl = await this.uploadProductImage(newImageFile);
        if (!imageUrl) {
          console.error('Image upload failed');
          return null;
        }
      }
      const productData = {
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description || null,
        image_url: imageUrl || product.image,
        category
      };

      if (product.id) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Product save failed:', error);
      return null;
    }
  } 
}
