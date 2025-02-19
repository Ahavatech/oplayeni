import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Prof. Olawanle Patrick Layeni - Mathematician</title>
        <meta name="description" content="Academic portfolio of Professor Olawanle Patrick Layeni, specializing in solid mechanics and continuum mechanics." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <section className="prose prose-slate max-w-none">
          <h2 className="text-3xl font-bold mb-6">Welcome</h2>
          <p className="text-lg mb-6">
            I am a Professor of Mathematics specializing in solid mechanics and continuum mechanics. 
            My research focuses on developing mathematical models to understand the behavior of 
            materials under various conditions.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Latest Research</h3>
              <p className="text-muted-foreground">
                Current work focuses on advanced mathematical modeling of material 
                deformation and stress analysis.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Teaching</h3>
              <p className="text-muted-foreground">
                Offering courses in advanced calculus, continuum mechanics, and 
                mathematical modeling.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
