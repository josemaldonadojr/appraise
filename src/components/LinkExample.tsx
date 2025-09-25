import { Link } from "~/components/ui/link"
import { BackLink } from "~/components/BackLink"

export function LinkExample() {
  return (
    <div className="space-y-6 p-8 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900">Link Component Examples</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Back Link</h3>
          <div className="flex flex-wrap gap-3">
            <BackLink href="#" />
            <BackLink href="#">Go Back</BackLink>
            <BackLink href="#">Return to Previous</BackLink>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Default Variants</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="#" variant="default">
              Next
            </Link>
            <Link href="#" variant="outline">
              Previous
            </Link>
            <Link href="#" variant="ghost">
              Cancel
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Different Sizes</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="#" size="sm">
              Small Link
            </Link>
            <Link href="#" size="default">
              Default Link
            </Link>
            <Link href="#" size="lg">
              Large Link
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Different Shapes</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="#" shape="default">
              Pill Shape
            </Link>
            <Link href="#" shape="rounded">
              Rounded
            </Link>
            <Link href="#" shape="square">
              Square
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Combined Examples</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="#" variant="default" size="sm">
              Small Dark
            </Link>
            <Link href="#" variant="outline" size="lg">
              Large Outline
            </Link>
            <Link href="#" variant="ghost" shape="rounded">
              Ghost Rounded
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
