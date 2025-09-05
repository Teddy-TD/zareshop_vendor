import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="add-product"
        options={{
          title: 'Add Product',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-product"
        options={{
          title: 'Edit Product',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="product-detail"
        options={{
          title: 'Product Details',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

