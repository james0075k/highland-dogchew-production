describe('Image Cropper', () => {
  beforeEach(() => {
    // Visit the settings page
    cy.visit('/admin/dashboard/settings')
    
    // Login if needed (you may need to adjust this based on your auth setup)
    // cy.login() // Uncomment if you have a custom login command
  })

  it('should open image cropper when clicking "Add New Image"', () => {
    // Navigate to the general tab (should be default)
    cy.get('[data-testid="general-tab"]').click()
    
    // Find and click the "Add New Image" button
    cy.get('[data-testid="add-new-image"]').click()
    
    // The image cropper modal should appear
    cy.get('.fixed.inset-0').should('be.visible')
    cy.contains('Image Cropper').should('be.visible')
  })

  it('should show upload area when no image is selected', () => {
    // Open the cropper
    cy.get('[data-testid="add-new-image"]').click()
    
    // Should show upload area
    cy.contains('Upload an image to crop').should('be.visible')
    cy.contains('Choose Image').should('be.visible')
  })

  it('should close cropper when clicking cancel', () => {
    // Open the cropper
    cy.get('[data-testid="add-new-image"]').click()
    
    // Click the close button (X)
    cy.get('button').contains('×').click()
    
    // The modal should be closed
    cy.get('.fixed.inset-0').should('not.exist')
  })

  it('should handle file upload in cropper', () => {
    // Open the cropper
    cy.get('[data-testid="add-new-image"]').click()
    
    // Upload a test image
    cy.fixture('example.json').then((data) => {
      // This is a placeholder - you'd need an actual image file
      cy.get('input[type="file"]').attachFile('test-image.jpg')
    })
    
    // The image should be displayed in the cropper
    cy.get('img[alt="Crop me"]').should('be.visible')
  })
}) 